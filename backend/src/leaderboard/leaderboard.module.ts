import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import { BetModule } from '../bet/bet.module'
import { MatchModule } from '../match/match.module'
import { UserModule } from '../user/user.module'
import { LeaderboardController } from './leaderboard.controller'
import { LeaderboardService } from './leaderboard.service'
import { Leaderboard, LeaderboardSchema } from './schemas/leaderboard.schema'

@Module({
	imports: [
		MongooseModule.forFeature([{ name: Leaderboard.name, schema: LeaderboardSchema }]),
		UserModule,
		MatchModule,
		BetModule,
	],
	controllers: [LeaderboardController],
	providers: [LeaderboardService],
	exports: [LeaderboardService],
})
export class LeaderboardModule {}
