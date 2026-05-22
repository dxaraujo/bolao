import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model, Types } from 'mongoose'

import { Bet } from '../bet/schemas/bet.schema'
import { Match, MatchStatus } from '../match/schemas/match.schema'
import { User } from '../user/schemas/user.schema'

@Injectable()
export class StatsService {

	constructor(
		@InjectModel(Match.name) private readonly matchModel: Model<Match>,
		@InjectModel(Bet.name) private readonly betModel: Model<Bet>,
		@InjectModel(User.name) private readonly userModel: Model<User>,
	) { }

	async find() {

		const activeUsers = await this.userModel.find({ isActive: true }).exec()

		// const { ranking, totalPoints, exactScore, winnerWithGoal, correctWinner, oneGoalCorrect, wrong } = user

		const totalFinishedMatches = await this.matchModel.countDocuments({ status: MatchStatus.FINISHED }).exec()
		const totalPointsDisputed = totalFinishedMatches * 5;

		const totalActiveUsers = await this.userModel.countDocuments({ isActive: true }).exec()

		const leader = await this.userModel.findOne({ isActive: true }).sort({ points: -1 }).exec()

		return {
			totalFinishedMatches,
			totalPointsDisputed,
			totalActiveUsers,
			leader: leader ? {
				name: leader.name,
				picture: leader.picture,
			} : null,
		}
	}
}
