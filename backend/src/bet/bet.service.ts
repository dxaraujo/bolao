import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'

import { MatchService } from '../match/match.service'
import { MatchDocument } from '../match/schemas/match.schema'
import { StageService } from '../stage/stage.service'
import { UserService } from '../user/user.service'
import { BetUpdateItemDto } from './dto/update-bets.dto'
import { Bet } from './schemas/bet.schema'

@Injectable()
export class BetService {

	constructor(
		@InjectModel(Bet.name) private readonly model: Model<Bet>,
		private readonly stageService: StageService,
		private readonly matchService: MatchService,
		private readonly userService: UserService,
	) { }

	async findAll(userId: string) {

		const [activeUsers, stageNames] = await Promise.all([
			this.userService.findActiveUsers(),
			this.stageService.findBlockedStages()
		])

		const matchIds = await this.matchService.findIdsByStages(stageNames)

		const bets = await this.model
			.find({ match: { $in: matchIds }, user: { $in: activeUsers.map((user) => user._id) } })
			.populate<{ match: MatchDocument }>('match')
			.exec()

		return bets.map((bet) => {
			const { _id, ...rest } = bet.toObject()
			return bet.user.toString() === userId ? { _id, ...rest } : rest
		}).sort((a, b) => a.match.utcDate.valueOf() - b.match.utcDate.valueOf() || a.match.footballDataId - b.match.footballDataId)
	}

	async seedBetsForMatch(matchStage: string) {

		const [matchIds, users] = await Promise.all([
			this.matchService.findIdsByStages([matchStage]),
			this.userService.findActiveUsers(),
		])

		if (matchIds.length === 0 || users.length === 0) return

		await this.model.bulkWrite(
			matchIds.flatMap(matchId =>
				users.map((user) => ({
					updateOne: {
						filter: { user: user._id, match: matchId },
						update: { $setOnInsert: { user: user._id, match: matchId } },
						upsert: true,
					},
				})),
			),
		)
	}

	async updateBets(userId: string, itens: BetUpdateItemDto[]) {

		if (itens.length === 0) return await this.findAll(userId)

		const openStages = await this.stageService.findOpenStages()
		const openMatchIds = await this.matchService.findIdsByStages(openStages)

		await this.model.bulkWrite(
			itens.map((item) => ({
				updateOne: {
					filter: { user: userId, _id: item._id, match: { $in: openMatchIds } },
					update: { $set: { homeTeamScore: item.homeTeamScore, awayTeamScore: item.awayTeamScore } },
				},
			})),
		)

		return await this.findAll(userId)
	}
}