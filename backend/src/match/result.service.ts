import { Injectable, Logger } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'

import { Bet, BetPopulated } from '../bet/schemas/bet.schema'
import { AppConfigService } from '../config/config.service'
import { StageService } from '../stage/stage.service'
import { User, UserDocument } from '../user/schemas/user.schema'
import { Match, MatchDocument } from './schemas/match.schema'

export interface UserAggregate {
	_id: UserDocument['_id']
	cumulativeTotal: number
	ranking: number
	previousRanking: number
	exactScore: number
	winnerWithGoal: number
	correctWinner: number
	oneGoalCorrect: number
	bets: BetPopulated[]
}

const isValidScore = (value: unknown): value is number =>
	typeof value === 'number' && Number.isFinite(value) && value >= 0

@Injectable()
export class ResultService {

	private readonly logger = new Logger(ResultService.name)

	constructor(
		@InjectModel(Match.name) private readonly matchModel: Model<Match>,
		@InjectModel(Bet.name) private readonly betModel: Model<Bet>,
		@InjectModel(User.name) private readonly userModel: Model<User>,
		private readonly appConfig: AppConfigService,
		private readonly stageService: StageService,
	) { }

	async updateResults() {

		await this.appConfig.setUpdatingScores(true)

		try {

			const blockedStages = await this.stageService.findBlockedStages()
			if (blockedStages.length === 0) return

			const [matches, activeUsers] = await Promise.all([
				this.matchModel
					.find({ stage: { $in: blockedStages } })
					.sort({ utcDate: 1, footballDataId: 1 })
					.exec(),
				this.userModel.find({ isActive: true }).exec(),
			])

			if (matches.length === 0 || activeUsers.length === 0) return

			const matchIds = matches.map((m) => m._id)
			const userIds = activeUsers.map((u) => u._id)

			const allBets = await this.betModel
				.find({ match: { $in: matchIds }, user: { $in: userIds } })
				.populate<{ match: MatchDocument }>('match')
				.exec()

			let users: UserAggregate[] = activeUsers.map((user) => ({
				_id: user._id,
				cumulativeTotal: 0,
				ranking: 0,
				previousRanking: 0,
				exactScore: 0,
				winnerWithGoal: 0,
				correctWinner: 0,
				oneGoalCorrect: 0,
				bets: allBets.filter((bet) => bet.user.equals(user._id)) as unknown as BetPopulated[],
			}))

			for (let i = 0; i < matches.length; i++) {
				const match = matches[i]
				if (!isValidScore(match.homeTeamScore) || !isValidScore(match.awayTeamScore)) continue

				for (const user of users) {
					const bet = findBet(user.bets, match)
					if (bet == null) continue
					calculateBetScore(bet, match)
					user.cumulativeTotal += bet.totalPointsEarned
					user.exactScore += bet.exactScore ? 1 : 0
					user.winnerWithGoal += bet.winnerWithGoal ? 1 : 0
					user.correctWinner += bet.correctWinner ? 1 : 0
					user.oneGoalCorrect += bet.oneGoalCorrect ? 1 : 0
					bet.cumulativeTotal = user.cumulativeTotal
				}

				users = rankUsers(users, i)

				for (const user of users) {
					const bet = findBet(user.bets, match)
					if (bet == null) continue
					bet.ranking = user.ranking
					bet.previousRanking = user.previousRanking
				}
			}

			await Promise.all(
				users.flatMap((user) => {
					const betUpdates = user.bets.map((bet) =>
						this.betModel
							.findByIdAndUpdate(
								bet._id,
								{
									totalPointsEarned: bet.totalPointsEarned,
									cumulativeTotal: bet.cumulativeTotal,
									ranking: bet.ranking,
									previousRanking: bet.previousRanking,
									exactScore: bet.exactScore,
									winnerWithGoal: bet.winnerWithGoal,
									correctWinner: bet.correctWinner,
									oneGoalCorrect: bet.oneGoalCorrect,
								},
								{ new: true },
							)
							.exec(),
					)
					const userUpdate = this.userModel
						.findByIdAndUpdate(
							user._id,
							{
								cumulativeTotal: user.cumulativeTotal,
								ranking: user.ranking,
								previousRanking: user.previousRanking,
								exactScore: user.exactScore,
								winnerWithGoal: user.winnerWithGoal,
								correctWinner: user.correctWinner,
								oneGoalCorrect: user.oneGoalCorrect,
							},
							{ new: true },
						)
						.exec()
					return [...betUpdates, userUpdate]
				}),
			)

		} finally {
			await this.appConfig.setUpdatingScores(false)
		}
	}
}

const findBet = (bets: BetPopulated[], match: MatchDocument) =>
	bets.find((bet) => bet.match.footballDataId === match.footballDataId)

export const calculateBetScore = (bet: BetPopulated, match: MatchDocument) => {
	if (!isValidScore(bet.homeTeamScore) || !isValidScore(bet.awayTeamScore)) {
		resetScore(bet)
		return
	}

	const betWinner = winner(bet.homeTeamScore, bet.awayTeamScore)
	const matchWinner = winner(match.homeTeamScore!, match.awayTeamScore!)

	if (bet.homeTeamScore === match.homeTeamScore && bet.awayTeamScore === match.awayTeamScore) {
		bet.totalPointsEarned = 5
		bet.exactScore = true
		bet.winnerWithGoal = false
		bet.correctWinner = false
		bet.oneGoalCorrect = false
		return
	}

	if (betWinner === matchWinner) {
		const scoredOneGoal =
			bet.homeTeamScore === match.homeTeamScore ||
			bet.awayTeamScore === match.awayTeamScore
		bet.totalPointsEarned = scoredOneGoal ? 3 : 2
		bet.exactScore = false
		bet.winnerWithGoal = scoredOneGoal
		bet.correctWinner = !scoredOneGoal
		bet.oneGoalCorrect = false
		return
	}

	const scoredOnlyOneGoal =
		bet.homeTeamScore === match.homeTeamScore ||
		bet.awayTeamScore === match.awayTeamScore
	bet.totalPointsEarned = scoredOnlyOneGoal ? 1 : 0
	bet.exactScore = false
	bet.winnerWithGoal = false
	bet.correctWinner = false
	bet.oneGoalCorrect = scoredOnlyOneGoal
}

const resetScore = (bet: BetPopulated) => {
	bet.totalPointsEarned = 0
	bet.exactScore = false
	bet.winnerWithGoal = false
	bet.correctWinner = false
	bet.oneGoalCorrect = false
}

const winner = (scoreA: number, scoreB: number): 'A' | 'B' | 'E' =>
	scoreA > scoreB ? 'A' : scoreB > scoreA ? 'B' : 'E'

export const rankUsers = (users: UserAggregate[], index: number): UserAggregate[] => {
	users.sort(compareUsers)
	let currentRank = 1
	let tiedCount = 1
	for (let i = 0; i < users.length; i++) {
		if (i > 0) {
			if (compareUsers(users[i], users[i - 1]) === 0) {
				currentRank = users[i - 1].ranking
				tiedCount += 1
			} else {
				currentRank = currentRank + tiedCount
				tiedCount = 1
			}
		}
		users[i].previousRanking = index > 0 ? users[i].ranking : 0
		users[i].ranking = currentRank
	}
	return users
}

const compareUsers = (u1: UserAggregate, u2: UserAggregate): number =>
	u2.cumulativeTotal - u1.cumulativeTotal ||
	u2.exactScore - u1.exactScore ||
	u2.winnerWithGoal - u1.winnerWithGoal ||
	u2.correctWinner - u1.correctWinner ||
	u2.oneGoalCorrect - u1.oneGoalCorrect
