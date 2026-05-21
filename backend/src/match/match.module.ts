import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import { AppConfigModule } from '../config/config.module'
import { Bet, BetSchema } from '../bet/schemas/bet.schema'
import { User, UserSchema } from '../user/schemas/user.schema'
import { StageModule } from '../stage/stage.module'
import { TeamModule } from '../team/team.module'
import { MatchController } from './match.controller'
import { ScoreService } from './score.service'
import { MatchService } from './match.service'
import { ResultService } from './result.service'
import { Match, MatchSchema } from './schemas/match.schema'

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: Match.name, schema: MatchSchema },
			{ name: Bet.name, schema: BetSchema },
			{ name: User.name, schema: UserSchema },
		]),
		AppConfigModule,
		StageModule,
		TeamModule,
	],
	controllers: [MatchController],
	providers: [MatchService, ScoreService, ResultService],
	exports: [MatchService, ScoreService, ResultService],
})
export class MatchModule {}
