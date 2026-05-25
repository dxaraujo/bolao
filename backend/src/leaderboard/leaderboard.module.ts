import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import { Bet, BetSchema } from '../bet/schemas/bet.schema'
import { Match, MatchSchema } from '../match/schemas/match.schema'
import { User, UserSchema } from '../user/schemas/user.schema'
import { LeaderboardController } from './leaderboard.controller'
import { LeaderboardService } from './leaderboard.service'
import { Leaderboard, LeaderboardSchema } from './schemas/leaderboard.schema'

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: Leaderboard.name, schema: LeaderboardSchema },
			{ name: User.name, schema: UserSchema },
			{ name: Bet.name, schema: BetSchema },
			{ name: Match.name, schema: MatchSchema },
		]),
	],
	controllers: [LeaderboardController],
	providers: [LeaderboardService],
	exports: [LeaderboardService],
})
export class LeaderboardModule {}
