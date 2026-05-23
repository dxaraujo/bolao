import { forwardRef, Inject, Injectable, Logger, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model, Types } from 'mongoose'

import { TeamDocument } from 'src/team/schemas/team.schema'
import { MatchService } from '../match/match.service'
import { MatchDocument } from '../match/schemas/match.schema'
import { StageService } from '../stage/stage.service'
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
		@Inject(forwardRef(() => UserService)) private readonly userService: UserService,
		@Inject(forwardRef(() => StageService)) private readonly stageService: StageService,
		@Inject(forwardRef(() => MatchService)) private readonly matchService: MatchService,
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

		const openStages = await this.stageService.findOpenStages()
		const openMatchIds = await this.matchService.findIdsByStages(openStages)

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

		const blockedStages = await this.stageService.findBlockedStages()

		if (blockedStages.length === 0) return []

		const matchIds = await this.matchService.findIdsByStages(blockedStages)

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

	async seedBetsForUser(userId: string) {

		const [openStages, blockedStages] = await Promise.all([
			this.stageService.findOpenStages(),
			this.stageService.findBlockedStages(),
		])
		const stages = [...openStages, ...blockedStages]

		if (stages.length === 0) {
			this.logger.log(`Skipping seed for user ${userId}: no OPEN/BLOCKED stages`)
			return
		}

		const matchIds = await this.matchService.findIdsByStages(stages)

		if (matchIds.length === 0) {
			this.logger.log(`Skipping seed for user ${userId}: no valid matches in OPEN/BLOCKED stages`)
			return
		}

		const result = await this.model.bulkWrite(
			matchIds.map((matchId) => ({
				updateOne: {
					filter: { user: userId, match: matchId },
					update: { $setOnInsert: { user: userId, match: matchId } },
					upsert: true,
				},
			})),
		)
		this.logger.log(`Seed user ${userId}: ${result.upsertedCount} new bet(s) across ${matchIds.length} match(es)`)
	}

	async seedBetsForStage(matchStage: string) {

		const users = await this.userService.findActiveUsers()

		if (users.length === 0) {
			this.logger.log(`Skipping seed for stage ${matchStage}: no active users`)
			return
		}

		for (const user of users) {
			await this.seedBetsForUser(user.id)
		}
		this.logger.log(`Seed stage ${matchStage}: processed ${users.length} active user(s)`)
	}

	async removeBetsForUser(userId: string) {
		const result = await this.model.deleteMany({ user: userId }).exec()
		this.logger.log(`Removed ${result.deletedCount} bet(s) for user ${userId}`)
	}
}