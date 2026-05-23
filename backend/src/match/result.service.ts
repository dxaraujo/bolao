import { Injectable, Logger } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model, Types } from 'mongoose'

import { Bet, BetPopulated } from '../bet/schemas/bet.schema'
import { AppConfigService } from '../config/config.service'
import { User } from '../user/schemas/user.schema'
import { Match, MatchDocument } from './schemas/match.schema'

interface UserTotals {
	totalPointsEarned: number
	exactScore: number
	winnerWithGoal: number
	correctWinner: number
	oneGoalCorrect: number
	wrong: number
}

export interface BetScore {
	totalPointsEarned: number
	exactScore: boolean
	winnerWithGoal: boolean
	correctWinner: boolean
	oneGoalCorrect: boolean
	wrong: boolean
}

interface ScorePair {
	homeTeamScore?: number
	awayTeamScore?: number
}

const ZERO_BET_SCORE: BetScore = {
	totalPointsEarned: 0,
	exactScore: false,
	winnerWithGoal: false,
	correctWinner: false,
	oneGoalCorrect: false,
	wrong: false,
}

const ZERO_TOTALS: UserTotals = {
	totalPointsEarned: 0,
	exactScore: 0,
	winnerWithGoal: 0,
	correctWinner: 0,
	oneGoalCorrect: 0,
	wrong: 0,
}

const isValidScore = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value) && value >= 0
const winner = (a: number, b: number): 'A' | 'B' | 'E' => a > b ? 'A' : b > a ? 'B' : 'E'

@Injectable()
export class ResultService {

	constructor(
		@InjectModel(Match.name) private readonly matchModel: Model<Match>,
		@InjectModel(Bet.name) private readonly betModel: Model<Bet>,
		@InjectModel(User.name) private readonly userModel: Model<User>,
		private readonly appConfig: AppConfigService,
	) { }

	async updateResults(changedMatchIds: Types.ObjectId[]) {

		if (changedMatchIds.length === 0) return

		const changedBets = await this.betModel
			.find({ match: { $in: changedMatchIds } })
			.populate<{ match: MatchDocument }>('match')
			.exec() as unknown as BetPopulated[]

		if (changedBets.length > 0) {
			await this.betModel.bulkWrite(changedBets.map((bet) => ({
				updateOne: {
					filter: { _id: bet._id },
					update: { $set: calculateBetScore(bet, bet.match) },
				},
			})))
		}

		const activeUsers = await this.userModel
			.find({ isActive: true })
			.sort({ name: 1 })
			.exec()

		if (activeUsers.length === 0) {
			await this.appConfig.setLastUpdateResults(new Date())
			return
		}

		const activeUserIds = activeUsers.map((u) => u._id)

		const aggregates = await this.betModel.aggregate<{ _id: Types.ObjectId } & UserTotals>([
			{ $match: { user: { $in: activeUserIds } } },
			{
				$group: {
					_id: '$user',
					totalPointsEarned: { $sum: '$totalPointsEarned' },
					exactScore: { $sum: { $cond: ['$exactScore', 1, 0] } },
					winnerWithGoal: { $sum: { $cond: ['$winnerWithGoal', 1, 0] } },
					correctWinner: { $sum: { $cond: ['$correctWinner', 1, 0] } },
					oneGoalCorrect: { $sum: { $cond: ['$oneGoalCorrect', 1, 0] } },
					wrong: { $sum: { $cond: ['$wrong', 1, 0] } },
				},
			},
		])

		const totalsByUserId = new Map<string, UserTotals>(aggregates.map(({ _id, ...totals }) => [_id.toString(), totals]))

		interface Row {
			_id: Types.ObjectId
			totals: UserTotals
			ranking: number
		}

		const rows: Row[] = activeUsers.map((u) => ({
			_id: u._id,
			totals: totalsByUserId.get(u._id.toString()) ?? { ...ZERO_TOTALS },
			ranking: 0,
		}))

		rows.sort(compareRows)

		let currentRank = 1
		let tiedCount = 1
		for (let i = 0; i < rows.length; i++) {
			if (i > 0) {
				if (compareRows(rows[i], rows[i - 1]) === 0) {
					currentRank = rows[i - 1].ranking
					tiedCount += 1
				} else {
					currentRank = currentRank + tiedCount
					tiedCount = 1
				}
			}
			rows[i].ranking = currentRank
		}

		await this.userModel.bulkWrite(rows.map((row) => ({
			updateOne: {
				filter: { _id: row._id },
				update: {
					$set: {
						totalPointsEarned: row.totals.totalPointsEarned,
						exactScore: row.totals.exactScore,
						winnerWithGoal: row.totals.winnerWithGoal,
						correctWinner: row.totals.correctWinner,
						oneGoalCorrect: row.totals.oneGoalCorrect,
						wrong: row.totals.wrong,
						ranking: row.ranking,
					},
				},
			},
		})))

		await this.appConfig.setLastUpdateResults(new Date())
	}
}

export const calculateBetScore = (bet: ScorePair, match: ScorePair): BetScore => {

	if (!isValidScore(bet.homeTeamScore) || !isValidScore(bet.awayTeamScore)) return ZERO_BET_SCORE
	if (!isValidScore(match.homeTeamScore) || !isValidScore(match.awayTeamScore)) return ZERO_BET_SCORE

	if (bet.homeTeamScore === match.homeTeamScore && bet.awayTeamScore === match.awayTeamScore) {
		return { ...ZERO_BET_SCORE, exactScore: true, totalPointsEarned: 5 }
	}

	const betWinner = winner(bet.homeTeamScore, bet.awayTeamScore)
	const matchWinner = winner(match.homeTeamScore, match.awayTeamScore)

	if (betWinner === matchWinner) {
		const scoredOneGoal = bet.homeTeamScore === match.homeTeamScore || bet.awayTeamScore === match.awayTeamScore
		if (scoredOneGoal) {
			return { ...ZERO_BET_SCORE, winnerWithGoal: true, totalPointsEarned: 3 }
		}
		return { ...ZERO_BET_SCORE, correctWinner: true, totalPointsEarned: 2 }
	}

	const scoredOnlyOneGoal = bet.homeTeamScore === match.homeTeamScore || bet.awayTeamScore === match.awayTeamScore
	if (scoredOnlyOneGoal) {
		return { ...ZERO_BET_SCORE, oneGoalCorrect: true, totalPointsEarned: 1 }
	}

	return { ...ZERO_BET_SCORE, wrong: true }
}

const compareRows = (a: { totals: UserTotals }, b: { totals: UserTotals }): number =>
	b.totals.totalPointsEarned - a.totals.totalPointsEarned ||
	b.totals.exactScore - a.totals.exactScore ||
	b.totals.winnerWithGoal - a.totals.winnerWithGoal ||
	b.totals.correctWinner - a.totals.correctWinner ||
	b.totals.oneGoalCorrect - a.totals.oneGoalCorrect
