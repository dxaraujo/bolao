import { StageStatus } from '@bolao/shared'
import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model, Types } from 'mongoose'

import { TeamDocument } from 'src/team/schemas/team.schema'
import { Match, MatchDocument } from '../match/schemas/match.schema'
import { Stage } from '../stage/schemas/stage.schema'
import { UserDocument } from '../user/schemas/user.schema'
import { UserService } from '../user/user.service'
import { UpdateBetsDto } from './dto/update-bets.dto'
import { Bet } from './schemas/bet.schema'

export interface GroupedBetItem {
	user: { _id: string; name: string; picture: string }
	homeTeamScore?: number
	awayTeamScore?: number
	exactScore: boolean
	winnerWithGoal: boolean
	correctWinner: boolean
	oneGoalCorrect: boolean
	wrong: boolean
	totalPointsEarned: number
}

export interface GroupedBet {
	matchId: string
	utcDate: Date
	stage: string
	group?: string
	homeTeam: { name: string; shortName: string; tla: string; crest: string }
	homeTeamScore?: number
	awayTeam: { name: string; shortName: string; tla: string; crest: string }
	awayTeamScore?: number
	exactScore: number
	winnerWithGoal: number
	correctWinner: number
	oneGoalCorrect: number
	wrong: number
	total: number
	bets: GroupedBetItem[]
}
@Injectable()
export class BetService {

	private readonly logger = new Logger(BetService.name)

	constructor(
		@InjectModel(Bet.name) private readonly model: Model<Bet>,
		@InjectModel(Stage.name) private readonly stageModel: Model<Stage>,
		@InjectModel(Match.name) private readonly matchModel: Model<Match>,
		private readonly userService: UserService,
	) { }

	async list(userId: string) {

		if (!Types.ObjectId.isValid(userId)) {
			throw new NotFoundException(`User ${userId} not valid`)
		}

		const bets = await this.model
			.find({ user: userId })
			.populate<{ match: MatchDocument & { homeTeam: TeamDocument; awayTeam: TeamDocument } }>({
				path: 'match',
				populate: [
					{ path: 'homeTeam' },
					{ path: 'awayTeam' }
				]
			})
			.exec()

		return bets.map((bet) => ({
			_id: bet._id,
			matchId: bet.match._id,
			utcDate: bet.match.utcDate,
			stage: bet.match.stage,
			group: bet.match.group,
			status: bet.match.status,
			homeTeam: {
				name: bet.match.homeTeam.name,
				shortName: bet.match.homeTeam.shortName,
				tla: bet.match.homeTeam.tla,
				crest: bet.match.homeTeam.crest,
			},
			awayTeam: {
				name: bet.match.awayTeam.name,
				shortName: bet.match.awayTeam.shortName,
				tla: bet.match.awayTeam.tla,
				crest: bet.match.awayTeam.crest,
			},
			matchHomeTeamScore: bet.match.homeTeamScore,
			matchAwayTeamScore: bet.match.awayTeamScore,
			homeTeamScore: bet.homeTeamScore,
			awayTeamScore: bet.awayTeamScore,
		})).sort((a, b) => a.utcDate.valueOf() - b.utcDate.valueOf())
	}

	async updateBets(userId: string, bets: UpdateBetsDto[]) {

		if (bets.length === 0) return

		if (!Types.ObjectId.isValid(userId)) {
			throw new NotFoundException(`User ${userId} not valid`)
		}

		const openStages = await this.findStageNamesByStatus([StageStatus.OPEN])
		const openMatchIds = await this.findMatchIdsByStages(openStages)

		await this.model.bulkWrite(
			bets.map((bet) => ({
				updateOne: {
					filter: { _id: bet._id, user: userId, match: { $in: openMatchIds } },
					update: { $set: { homeTeamScore: bet.homeTeamScore, awayTeamScore: bet.awayTeamScore } },
				},
			})),
		)
	}

	async listAll() {

		const blockedStages = await this.findStageNamesByStatus([StageStatus.BLOCKED])

		if (blockedStages.length === 0) return []

		const matchIds = await this.findMatchIdsByStages(blockedStages)

		if (matchIds.length === 0) return []

		const activeUserIds = (await this.userService.findActiveUsers()).map((u) => u._id)

		const bets = await this.model
			.find({ match: { $in: matchIds }, user: { $in: activeUserIds } })
			.populate<{ match: MatchDocument & { homeTeam: TeamDocument; awayTeam: TeamDocument } }>({
				path: 'match',
				populate: [
					{ path: 'homeTeam' },
					{ path: 'awayTeam' }
				]
			})
			.populate<{ user: UserDocument }>('user')
			.exec()

		const groupedBets = bets.reduce<Record<string, GroupedBet>>((acc, bet) => {
			const matchId = bet.match.id
			acc[matchId] = acc[matchId] || {
				matchId,
				utcDate: bet.match.utcDate,
				stage: bet.match.stage,
				group: bet.match.group,
				homeTeam: {
					name: bet.match.homeTeam.name,
					shortName: bet.match.homeTeam.shortName,
					tla: bet.match.homeTeam.tla,
					crest: bet.match.homeTeam.crest,
				},
				homeTeamScore: bet.match.homeTeamScore,
				awayTeam: {
					name: bet.match.awayTeam.name,
					shortName: bet.match.awayTeam.shortName,
					tla: bet.match.awayTeam.tla,
					crest: bet.match.awayTeam.crest,
				},
				awayTeamScore: bet.match.awayTeamScore,
				exactScore: 0,
				winnerWithGoal: 0,
				correctWinner: 0,
				oneGoalCorrect: 0,
				wrong: 0,
				total: 0,
				bets: [],
			}
			const entry = acc[matchId]
			entry.exactScore += bet.exactScore ? 1 : 0
			entry.winnerWithGoal += bet.winnerWithGoal ? 1 : 0
			entry.correctWinner += bet.correctWinner ? 1 : 0
			entry.oneGoalCorrect += bet.oneGoalCorrect ? 1 : 0
			entry.wrong += bet.wrong ? 1 : 0
			entry.total++
			entry.bets.push({
				user: {
					_id: bet.user.id,
					name: bet.user.name,
					picture: bet.user.picture,
				},
				homeTeamScore: bet.homeTeamScore,
				awayTeamScore: bet.awayTeamScore,
				exactScore: bet.exactScore,
				winnerWithGoal: bet.winnerWithGoal,
				correctWinner: bet.correctWinner,
				oneGoalCorrect: bet.oneGoalCorrect,
				wrong: bet.wrong,
				totalPointsEarned: bet.totalPointsEarned,
			})
			return acc
		}, {})

		return Object.values(groupedBets)
			.map((group) => ({
				...group,
				bets: group.bets.sort((a, b) => a.user.name.localeCompare(b.user.name, 'pt-BR')),
			}))
			.sort((a, b) => a.utcDate.valueOf() - b.utcDate.valueOf())
	}

	private async findStageNamesByStatus(statuses: StageStatus[]): Promise<string[]> {
		const stages = await this.stageModel.find({ status: { $in: statuses } }, { matchStage: 1 }).exec()
		return stages.map((s) => s.matchStage)
	}

	private findMatchIdsByStages(stageNames: string[]) {
		return this.matchModel.find({ stage: { $in: stageNames }, valid: true }).distinct('_id').exec()
	}
}