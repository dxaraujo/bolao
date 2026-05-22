import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import { Bet, BetSchema } from '../bet/schemas/bet.schema'
import { Match, MatchSchema } from '../match/schemas/match.schema'
import { User, UserSchema } from '../user/schemas/user.schema'
import { StatsController } from './stats.controller'
import { StatsService } from './stats.service'

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: Match.name, schema: MatchSchema },
			{ name: Bet.name, schema: BetSchema },
			{ name: User.name, schema: UserSchema },
		]),
	],
	controllers: [StatsController],
	providers: [StatsService],
	exports: [StatsService],
})
export class StatsModule {}
