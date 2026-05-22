import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import { Bet, BetSchema } from '../bet/schemas/bet.schema'
import { Match, MatchSchema } from '../match/schemas/match.schema'
import { User, UserSchema } from '../user/schemas/user.schema'
import { RankingController } from './ranking.controller'
import { RankingService } from './ranking.service'

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: Match.name, schema: MatchSchema },
			{ name: Bet.name, schema: BetSchema },
			{ name: User.name, schema: UserSchema },
		]),
	],
	controllers: [RankingController],
	providers: [RankingService],
	exports: [RankingService],
})
export class RankingModule {}
