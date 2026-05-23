import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'

import { Bet } from '../bet/schemas/bet.schema'
import { Match } from '../match/schemas/match.schema'
import { User } from '../user/schemas/user.schema'

@Injectable()
export class RankingService {

	constructor(
		@InjectModel(Match.name) private readonly matchModel: Model<Match>,
		@InjectModel(Bet.name) private readonly betModel: Model<Bet>,
		@InjectModel(User.name) private readonly userModel: Model<User>,
	) { }

	async find() {
		const activeUsers = await this.userModel.find({ isActive: true }).exec()
		return activeUsers.map((user) => ({
			name: user.name,
			picture: user.picture,
			ranking: user.ranking,
			totalPointsEarned: user.totalPointsEarned,
			exactScore: user.exactScore,
			winnerWithGoal: user.winnerWithGoal,
			correctWinner: user.correctWinner,
			oneGoalCorrect: user.oneGoalCorrect,
			wrong: user.wrong,
		})).sort((u1, u2) => u2.ranking - u1.ranking || u1.name.localeCompare(u2.name, 'pt-BR'))
	}
}
