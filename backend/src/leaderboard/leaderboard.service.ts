import {
	calculateBetScore,
	compareLeaderboardRows,
	MatchStatus,
	SCORING_RULES,
	STAGE_EXPECTED_MATCHES,
	type BetResult,
	type Distribution,
	type LeaderboardItem,
	type LeaderboardPayload,
	type StatsOverview,
	type UserAccuracy,
} from '@bolao/shared'

const TOTAL_EXPECTED_MATCHES = Object.values(STAGE_EXPECTED_MATCHES).reduce((sum, n) => sum + n, 0)
import { Injectable, Logger } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model, Types } from 'mongoose'

import { Bet } from '../bet/schemas/bet.schema'
import { Match } from '../match/schemas/match.schema'
import { User, UserDocument } from '../user/schemas/user.schema'
import { Leaderboard, LeaderboardRowSub } from './schemas/leaderboard.schema'

const SINGLETON_KEY = 'singleton'

interface UserAggregate {
	user: UserDocument
	points: number
	breakdown: { exactScore: number; winnerWithGoal: number; correctWinner: number; oneGoalCorrect: number; wrong: number }
	totalBets: number
}

@Injectable()
export class LeaderboardService {
	private readonly logger = new Logger(LeaderboardService.name)

	constructor(
		@InjectModel(Leaderboard.name) private readonly leaderboardModel: Model<Leaderboard>,
		@InjectModel(Bet.name) private readonly betModel: Model<Bet>,
		@InjectModel(Match.name) private readonly matchModel: Model<Match>,
		@InjectModel(User.name) private readonly userModel: Model<User>,
	) {}

	/**
	 * Recomputa o leaderboard a partir de bets × matches (LIVE + FINISHED pontuam).
	 * Sobreve singleton. Síncrono — volume baixo (50 users × 100 matches).
	 */
	async rebuild(): Promise<LeaderboardPayload> {
		this.logger.log('Leaderboard rebuild started')
		const activeUsers = await this.userModel.find({ isActive: true }).sort({ name: 1 }).exec()

		if (activeUsers.length === 0) {
			const payload = await this.persist([])
			this.logger.log('Leaderboard rebuilt with 0 active users')
			return payload
		}

		const aggregates = await this.computeAggregates(activeUsers)
		const ranked = this.rank(aggregates)
		const payload = await this.persist(ranked)
		this.logger.log(`Leaderboard rebuilt with ${ranked.length} active user(s)`)
		return payload
	}

	async getCurrent(): Promise<LeaderboardPayload> {
		const doc = await this.leaderboardModel.findOne({ key: SINGLETON_KEY }).exec()
		if (!doc) return { generatedAt: new Date(0).toISOString(), rows: [] }
		const userIds = doc.rows.map((r) => r.user)
		const users = await this.userModel.find({ _id: { $in: userIds } }).exec()
		const userById = new Map(users.map((u) => [u._id.toString(), u]))
		const rows: LeaderboardItem[] = doc.rows.map((r) => {
			const u = userById.get(r.user.toString())
			return {
				rank: r.rank,
				user: { _id: r.user.toString(), name: u?.name ?? '?', givenName: u?.givenName, avatar: u?.avatar },
				points: r.points,
				breakdown: r.breakdown,
			}
		})
		return { generatedAt: doc.generatedAt.toISOString(), rows }
	}

	async statsOverview(): Promise<StatsOverview> {
		const finishedMatches = await this.matchModel.countDocuments({ status: MatchStatus.FINISHED }).exec()
		const totalMatches = TOTAL_EXPECTED_MATCHES
		const lb = await this.getCurrent()
		const breakdownSum = lb.rows.reduce(
			(acc, r) => {
				acc.exact += r.breakdown.exactScore
				acc.wg += r.breakdown.winnerWithGoal
				acc.cw += r.breakdown.correctWinner
				acc.ogc += r.breakdown.oneGoalCorrect
				acc.wrong += r.breakdown.wrong
				return acc
			},
			{ exact: 0, wg: 0, cw: 0, ogc: 0, wrong: 0 },
		)
		const correctCount = breakdownSum.exact + breakdownSum.wg + breakdownSum.cw + breakdownSum.ogc
		const evaluated = correctCount + breakdownSum.wrong
		const pointsInPlay = (totalMatches - finishedMatches) * SCORING_RULES.exactScore
		const groupAccuracyPct = evaluated > 0 ? Math.round((correctCount / evaluated) * 100) : 0
		return {
			totalMatches,
			finishedMatches,
			totalExactBets: breakdownSum.exact,
			pointsInPlay,
			groupAccuracyPct,
		}
	}

	async statsAccuracy(): Promise<UserAccuracy[]> {
		const activeUsers = await this.userModel.find({ isActive: true }).sort({ name: 1 }).exec()
		const aggregates = await this.computeAggregates(activeUsers)
		return [...aggregates]
			.sort((a, b) => compareLeaderboardRows(a, b) || a.user.name.localeCompare(b.user.name, 'pt-BR'))
			.map(
				(a): UserAccuracy => ({
					_id: a.user._id.toString(),
					name: a.user.name,
					avatar: a.user.avatar,
					totalBets: a.totalBets,
					exactScore: a.breakdown.exactScore,
					winnerWithGoal: a.breakdown.winnerWithGoal,
					correctWinner: a.breakdown.correctWinner,
					oneGoalCorrect: a.breakdown.oneGoalCorrect,
					wrong: a.breakdown.wrong,
					accuracyPct: a.totalBets > 0 ? Math.round((a.breakdown.exactScore / a.totalBets) * 100) : 0,
				}),
			)
	}

	async statsDistribution(): Promise<Distribution> {
		const activeUsers = await this.userModel.find({ isActive: true }).exec()
		const aggregates = await this.computeAggregates(activeUsers)
		const totals = aggregates.reduce(
			(acc, a) => {
				acc.exact += a.breakdown.exactScore
				acc.winnerWithGoal += a.breakdown.winnerWithGoal
				acc.correctWinner += a.breakdown.correctWinner
				acc.oneGoalCorrect += a.breakdown.oneGoalCorrect
				acc.wrong += a.breakdown.wrong
				return acc
			},
			{ exact: 0, winnerWithGoal: 0, correctWinner: 0, oneGoalCorrect: 0, wrong: 0 },
		)
		const total = totals.exact + totals.winnerWithGoal + totals.correctWinner + totals.oneGoalCorrect + totals.wrong
		const pct = (n: number) => (total > 0 ? Math.round((n / total) * 100) : 0)
		return {
			exact: { count: totals.exact, pct: pct(totals.exact) },
			winnerWithGoal: { count: totals.winnerWithGoal, pct: pct(totals.winnerWithGoal) },
			correctWinner: { count: totals.correctWinner, pct: pct(totals.correctWinner) },
			oneGoalCorrect: { count: totals.oneGoalCorrect, pct: pct(totals.oneGoalCorrect) },
			wrong: { count: totals.wrong, pct: pct(totals.wrong) },
			totalEvaluatedBets: total,
		}
	}

	private async computeAggregates(activeUsers: UserDocument[]): Promise<UserAggregate[]> {
		const activeUserIds = activeUsers.map((u) => u._id)

		// Scored matches: LIVE ou FINISHED com score presente
		const scoredMatches = await this.matchModel.find({ status: { $in: [MatchStatus.LIVE, MatchStatus.FINISHED] }, score: { $exists: true } }).exec()
		const matchById = new Map(scoredMatches.map((m) => [m._id.toString(), m]))

		if (scoredMatches.length === 0) {
			return activeUsers.map((user) => ({
				user,
				points: 0,
				breakdown: { exactScore: 0, winnerWithGoal: 0, correctWinner: 0, oneGoalCorrect: 0, wrong: 0 },
				totalBets: 0,
			}))
		}

		const matchIds = scoredMatches.map((m) => m._id)
		const bets = await this.betModel.find({ user: { $in: activeUserIds }, match: { $in: matchIds } }).exec()

		const byUser = new Map<string, UserAggregate>()
		for (const user of activeUsers) {
			byUser.set(user._id.toString(), {
				user,
				points: 0,
				breakdown: { exactScore: 0, winnerWithGoal: 0, correctWinner: 0, oneGoalCorrect: 0, wrong: 0 },
				totalBets: 0,
			})
		}

		for (const bet of bets) {
			const agg = byUser.get(bet.user.toString())
			if (!agg) continue
			const match = matchById.get(bet.match.toString())
			if (!match || !match.score) continue
			const result: BetResult = calculateBetScore(bet.score, { home: match.score.home, away: match.score.away })
			agg.points += result.points
			agg.totalBets += 1
			if (result.exactScore) agg.breakdown.exactScore++
			if (result.winnerWithGoal) agg.breakdown.winnerWithGoal++
			if (result.correctWinner) agg.breakdown.correctWinner++
			if (result.oneGoalCorrect) agg.breakdown.oneGoalCorrect++
			if (result.wrong) agg.breakdown.wrong++
		}

		return Array.from(byUser.values())
	}

	private rank(aggregates: UserAggregate[]): Array<UserAggregate & { rank: number }> {
		const sorted = [...aggregates].sort((a, b) => compareLeaderboardRows(a, b))
		const out: Array<UserAggregate & { rank: number }> = []
		let currentRank = 1
		let tied = 1
		for (let i = 0; i < sorted.length; i++) {
			if (i > 0) {
				if (compareLeaderboardRows(sorted[i], sorted[i - 1]) === 0) {
					currentRank = out[i - 1].rank
					tied++
				} else {
					currentRank = currentRank + tied
					tied = 1
				}
			}
			out.push({ ...sorted[i], rank: currentRank })
		}
		return out
	}

	private async persist(rows: Array<UserAggregate & { rank: number }>): Promise<LeaderboardPayload> {
		const now = new Date()
		const rowSubs: LeaderboardRowSub[] = rows.map((r) => ({
			user: r.user._id,
			points: r.points,
			breakdown: r.breakdown,
			rank: r.rank,
		}))
		await this.leaderboardModel
			.updateOne({ key: SINGLETON_KEY }, { $set: { key: SINGLETON_KEY, generatedAt: now, rows: rowSubs } }, { upsert: true })
			.exec()
		return {
			generatedAt: now.toISOString(),
			rows: rows.map((r) => ({
				rank: r.rank,
				user: { _id: r.user._id.toString(), name: r.user.name, givenName: r.user.givenName, avatar: r.user.avatar },
				points: r.points,
				breakdown: r.breakdown,
			})),
		}
	}
}
