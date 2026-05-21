import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import { Bet, BetSchema } from '../bet/schemas/bet.schema'
import { Match, MatchSchema } from '../match/schemas/match.schema'
import { User, UserSchema } from '../user/schemas/user.schema'
import { Stage, StageSchema } from './schemas/stage.schema'
import { StageController } from './stage.controller'
import { StageService } from './stage.service'

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: Stage.name, schema: StageSchema },
			{ name: Match.name, schema: MatchSchema },
			{ name: Bet.name, schema: BetSchema },
			{ name: User.name, schema: UserSchema },
		]),
	],
	controllers: [StageController],
	providers: [StageService],
	exports: [StageService],
})
export class StageModule {}
