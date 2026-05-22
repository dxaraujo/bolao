import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model, Types } from 'mongoose'

import { MatchService } from '../match/match.service'
import { MatchDocument } from '../match/schemas/match.schema'
import { StageService } from '../stage/stage.service'
import { UserDocument } from '../user/schemas/user.schema'
import { UserService } from '../user/user.service'
import { BetUpdateItemDto } from './dto/update-bets.dto'
import { Bet } from './schemas/bet.schema'

@Injectable()
export class BetService {

	constructor(
		@InjectModel(Bet.name) private readonly model: Model<Bet>,
		private readonly userService: UserService,
		private readonly stageService: StageService,
		private readonly matchService: MatchService
	) { }

	async findAll(userId: string) {

		const [activeUsers, blockedStages, openStages] = await Promise.all([
			this.userService.findActiveUsers(),
			this.stageService.findBlockedStages(),
			this.stageService.findOpenStages(),
		])

		const [blockedMatchIds, openMatchIds] = await Promise.all([
			this.matchService.findIdsByStages(blockedStages),
			this.matchService.findIdsByStages(openStages),
		])

		const activeUserIds = activeUsers.map((user) => user._id)

		const [blockedBets, openBets] = await Promise.all([
			blockedMatchIds.length === 0
				? []
				: this.model
					.find({ match: { $in: blockedMatchIds }, user: { $in: activeUserIds } })
					.populate<{ match: MatchDocument }>('match')
					.exec(),
			openMatchIds.length === 0
				? []
				: this.model
					.find({ match: { $in: openMatchIds }, user: userId })
					.populate<{ match: MatchDocument }>('match')
					.exec(),
		])

		const bets = [...openBets, ...blockedBets]

		return bets.map((bet) => {
			const { _id, ...rest } = bet.toObject()
			return bet.user.toString() === userId ? { _id, ...rest } : rest
		}).sort((a, b) => a.match.utcDate.valueOf() - b.match.utcDate.valueOf() || a.match.footballDataId - b.match.footballDataId)
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

	async findByMatch(matchId: string) {

		if (!Types.ObjectId.isValid(matchId)) {
			throw new NotFoundException(`Match ${matchId} not valid`)
		}

		const match = await this.matchService.findById(matchId)
		if (!match) {
			throw new NotFoundException(`Match ${matchId} not found`)
		}

		const stageBlocked = await this.stageService.isStageBlocked(match.stage)
		if (!stageBlocked) {
			throw new ForbiddenException('Bets are only available after the stage is blocked')
		}

		const activeUserIds = (await this.userService.findActiveUsers()).map((user) => user._id)

		const bets = await this.model
			.find({ match: match._id, user: { $in: activeUserIds } })
			.populate<{ user: UserDocument }>('user')
			.exec()

		return bets
			.map((bet) => bet.toObject())
			.sort((a, b) => {
				const nameA = (a.user as UserDocument).name
				const nameB = (b.user as UserDocument).name
				return nameA.localeCompare(nameB, 'pt-BR')
			})
	}
}