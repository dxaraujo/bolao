import { Module } from '@nestjs/common'
import { ScheduleModule as NestScheduleModule } from '@nestjs/schedule'

import { MatchModule } from '../match/match.module'
import { StageModule } from '../stage/stage.module'
import { BlockStagesTask } from './block-stages.task'
import { ImportMatchesTask } from './import-matches.task'
import { UpdateScoresTask } from './update-scores.task'

@Module({
	imports: [NestScheduleModule.forRoot(), MatchModule, StageModule],
	providers: [UpdateScoresTask, ImportMatchesTask, BlockStagesTask],
})
export class ScheduleModule {}
