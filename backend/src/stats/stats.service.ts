import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model, Types } from 'mongoose'

import { MatchStage } from '@bolao/shared'

import { Bet } from '../bet/schemas/bet.schema'
import { Match, MatchStatus } from '../match/schemas/match.schema'
import { User, UserDocument } from '../user/schemas/user.schema'

export interface StatsOverview {
	totalMatches: number
	totalExactBets: number
	totalCorrectBets: number
	leader: { _id: string; name: string; picture: string; totalPointsEarned: number } | null
}

export interface UserAccuracy {
	_id: string
	name: string
	picture: string
	exactScore: number
	winnerWithGoal: number
	correctWinner: number
	oneGoalCorrect: number
	wrong: number
	totalBets: number
	accuracyPct: number
}

export interface StageAccuracy {
	matchStage: MatchStage
	users: Array<{ _id: string; name: string; accuracyPct: number }>
}

export interface Distribution {
	exact: { count: number; pct: number }
	winnerWithGoal: { count: number; pct: number }
	correctWinner: { count: number; pct: number }
	oneGoalCorrect: { count: number; pct: number }
	wrong: { count: number; pct: number }
	totalEvaluatedBets: number
}

@Injectable()
export class StatsService {

	constructor(
		@InjectModel(Match.name) private readonly matchModel: Model<Match>,
		@InjectModel(Bet.name) private readonly betModel: Model<Bet>,
		@InjectModel(User.name) private readonly userModel: Model<User>,
	) { }

	async overview(): Promise<StatsOverview> {

		const [totalMatches, totalExactBets, totalCorrectBets, leader] = await Promise.all([
			this.matchModel.countDocuments({ status: MatchStatus.FINISHED }).exec(),
			this.betModel.countDocuments({ exactScore: true }).exec(),
			this.betModel.countDocuments({
				$or: [{ winnerWithGoal: true }, { oneGoalCorrect: true }, { correctWinner: true }],
			}).exec(),
			this.userModel.findOne({ isActive: true }).sort({ totalPointsEarned: -1, name: 1 }).exec(),
		])

		return {
			totalMatches,
			totalExactBets,
			totalCorrectBets,
			leader: leader && {
				_id: leader.id,
				name: leader.name,
				picture: leader.picture,
				totalPointsEarned: leader.totalPointsEarned,
			},
		}
	}

	async accuracyByUser(): Promise<UserAccuracy[]> {

		const activeUsers = await this.userModel.find({ isActive: true }).exec()
		const activeUserIds = activeUsers.map((u) => u._id)
		const finishedMatchIds = await this.matchModel.find({ status: MatchStatus.FINISHED }).distinct('_id').exec()

		if (finishedMatchIds.length === 0 || activeUserIds.length === 0) {
			return activeUsers.map((u) => this.emptyUserAccuracy(u))
		}

		const grouped = await this.betModel.aggregate<{
			_id: Types.ObjectId
			exactScore: number
			winnerWithGoal: number
			correctWinner: number
			oneGoalCorrect: number
			wrong: number
			totalBets: number
		}>([
			{ $match: { user: { $in: activeUserIds }, match: { $in: finishedMatchIds } } },
			{
				$group: {
					_id: '$user',
					exactScore: { $sum: { $cond: ['$exactScore', 1, 0] } },
					winnerWithGoal: { $sum: { $cond: ['$winnerWithGoal', 1, 0] } },
					correctWinner: { $sum: { $cond: ['$correctWinner', 1, 0] } },
					oneGoalCorrect: { $sum: { $cond: ['$oneGoalCorrect', 1, 0] } },
					wrong: { $sum: { $cond: ['$wrong', 1, 0] } },
					totalBets: { $sum: 1 },
				},
			},
		])

		const byUser = new Map(grouped.map((g) => [g._id.toString(), g]))

		return activeUsers
			.map((user) => {
				const g = byUser.get(user.id)
				if (!g) return this.emptyUserAccuracy(user)
				const accuracyPct = g.totalBets === 0 ? 0 : Math.round((g.exactScore / g.totalBets) * 100)
				return {
					_id: user.id,
					name: user.name,
					picture: user.picture,
					exactScore: g.exactScore,
					winnerWithGoal: g.winnerWithGoal,
					correctWinner: g.correctWinner,
					oneGoalCorrect: g.oneGoalCorrect,
					wrong: g.wrong,
					totalBets: g.totalBets,
					accuracyPct,
				}
			})
			.sort((a, b) => b.accuracyPct - a.accuracyPct || a.name.localeCompare(b.name, 'pt-BR'))
	}

	async accuracyByStage(): Promise<StageAccuracy[]> {

		const activeUsers = await this.userModel.find({ isActive: true }).exec()
		const activeUserIds = activeUsers.map((u) => u._id)

		const finishedMatches = await this.matchModel.find({ status: MatchStatus.FINISHED }, { _id: 1, stage: 1 }).exec()
		if (finishedMatches.length === 0 || activeUserIds.length === 0) return []

		const matchIdToStage = new Map(finishedMatches.map((m) => [m._id.toString(), m.stage]))

		const grouped = await this.betModel.aggregate<{
			_id: { user: Types.ObjectId; match: Types.ObjectId }
			exact: number
			correct: number
			total: number
		}>([
			{ $match: { user: { $in: activeUserIds }, match: { $in: finishedMatches.map((m) => m._id) } } },
			{
				$group: {
					_id: { user: '$user', match: '$match' },
					exact: { $sum: { $cond: ['$exactScore', 1, 0] } },
					correct: {
						$sum: {
							$cond: [
								{ $or: ['$winnerWithGoal', '$oneGoalCorrect', '$correctWinner'] },
								1,
								0,
							],
						},
					},
					total: { $sum: 1 },
				},
			},
		])

		const byStage = new Map<MatchStage, Map<string, { exact: number; total: number }>>()

		for (const g of grouped) {
			const stage = matchIdToStage.get(g._id.match.toString())
			if (!stage) continue
			const userKey = g._id.user.toString()
			if (!byStage.has(stage)) byStage.set(stage, new Map())
			const entry = byStage.get(stage)!.get(userKey) ?? { exact: 0, total: 0 }
			entry.exact += g.exact
			entry.total += g.total
			byStage.get(stage)!.set(userKey, entry)
		}

		return Array.from(byStage.entries()).map(([stage, perUser]) => ({
			matchStage: stage as MatchStage,
			users: activeUsers
				.map((u) => {
					const entry = perUser.get(u.id) ?? { exact: 0, total: 0 }
					const accuracyPct = entry.total === 0 ? 0 : Math.round((entry.exact / entry.total) * 100)
					return { _id: u.id, name: u.name, accuracyPct }
				}),
		}))
	}

	async distribution(): Promise<Distribution> {

		const finishedMatchIds = await this.matchModel.find({ status: MatchStatus.FINISHED }).distinct('_id').exec()
		const activeUserIds = await this.userModel.find({ isActive: true }).distinct('_id').exec()

		if (finishedMatchIds.length === 0 || activeUserIds.length === 0) {
			return {
				exact: { count: 0, pct: 0 },
				winnerWithGoal: { count: 0, pct: 0 },
				correctWinner: { count: 0, pct: 0 },
				oneGoalCorrect: { count: 0, pct: 0 },
				wrong: { count: 0, pct: 0 },
				totalEvaluatedBets: 0,
			}
		}

		const [agg] = await this.betModel.aggregate<{
			exact: number
			winnerWithGoal: number
			correctWinner: number
			oneGoalCorrect: number
			wrong: number
			total: number
		}>([
			{ $match: { user: { $in: activeUserIds }, match: { $in: finishedMatchIds } } },
			{
				$group: {
					_id: null,
					exact: { $sum: { $cond: ['$exactScore', 1, 0] } },
					winnerWithGoal: { $sum: { $cond: ['$winnerWithGoal', 1, 0] } },
					correctWinner: { $sum: { $cond: ['$correctWinner', 1, 0] } },
					oneGoalCorrect: { $sum: { $cond: ['$oneGoalCorrect', 1, 0] } },
					wrong: { $sum: { $cond: ['$wrong', 1, 0] } },
					total: { $sum: 1 },
				},
			},
		])

		const total = agg?.total ?? 0
		const pct = (n: number) => (total === 0 ? 0 : Math.round((n / total) * 100))

		return {
			exact: { count: agg?.exact ?? 0, pct: pct(agg?.exact ?? 0) },
			winnerWithGoal: { count: agg?.winnerWithGoal ?? 0, pct: pct(agg?.winnerWithGoal ?? 0) },
			correctWinner: { count: agg?.correctWinner ?? 0, pct: pct(agg?.correctWinner ?? 0) },
			oneGoalCorrect: { count: agg?.oneGoalCorrect ?? 0, pct: pct(agg?.oneGoalCorrect ?? 0) },
			wrong: { count: agg?.wrong ?? 0, pct: pct(agg?.wrong ?? 0) },
			totalEvaluatedBets: total,
		}
	}

	private emptyUserAccuracy(user: UserDocument): UserAccuracy {
		return {
			_id: user.id,
			name: user.name,
			picture: user.picture,
			exactScore: 0,
			winnerWithGoal: 0,
			correctWinner: 0,
			oneGoalCorrect: 0,
			wrong: 0,
			totalBets: 0,
			accuracyPct: 0,
		}
	}
}
