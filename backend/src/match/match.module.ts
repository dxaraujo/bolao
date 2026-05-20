import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import { AppConfigModule } from '../config/config.module'
import { Bet, BetSchema } from '../bet/schemas/bet.schema'
import { User, UserSchema } from '../user/schemas/user.schema'
import { TeamModule } from '../team/team.module'
import { MatchController } from './match.controller'
import { MatchImportService } from './match-import.service'
import { MatchUpdateScoreService } from './match-update-score.service'
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
		TeamModule,
	],
	controllers: [MatchController],
	providers: [MatchService, MatchImportService, MatchUpdateScoreService, ResultService],
	exports: [MatchService, MatchImportService, MatchUpdateScoreService, ResultService],
})
export class MatchModule {}
