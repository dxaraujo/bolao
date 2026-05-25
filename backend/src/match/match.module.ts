import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import { Stage, StageSchema } from '../stage/schemas/stage.schema'
import { StageModule } from '../stage/stage.module'
import { TeamModule } from '../team/team.module'
import { MatchController } from './match.controller'
import { MatchService } from './match.service'
import { ScoreService } from './score.service'
import { Match, MatchSchema } from './schemas/match.schema'

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: Match.name, schema: MatchSchema },
			{ name: Stage.name, schema: StageSchema },
		]),
		StageModule,
		TeamModule,
	],
	controllers: [MatchController],
	providers: [MatchService, ScoreService],
	exports: [MatchService, ScoreService, MongooseModule],
})
export class MatchModule {}
