import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import { LeaderboardModule } from '../leaderboard/leaderboard.module'
import { Stage, StageSchema } from '../stage/schemas/stage.schema'
import { StageModule } from '../stage/stage.module'
import { SystemStateModule } from '../system-state/system-state.module'
import { TeamModule } from '../team/team.module'
import { MatchController } from './match.controller'
import { MatchService } from './match.service'
import { Match, MatchSchema } from './schemas/match.schema'

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: Match.name, schema: MatchSchema },
			{ name: Stage.name, schema: StageSchema },
		]),
		StageModule,
		TeamModule,
		LeaderboardModule,
		SystemStateModule,
	],
	controllers: [MatchController],
	providers: [MatchService],
	exports: [MatchService, MongooseModule],
})
export class MatchModule {}
