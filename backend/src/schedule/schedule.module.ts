import { Module } from '@nestjs/common'
import { ScheduleModule as NestScheduleModule } from '@nestjs/schedule'

import { MatchModule } from '../match/match.module'
import { ImportMatchesTask } from './import-matches.task'
import { UpdateScoresTask } from './update-scores.task'

@Module({
	imports: [NestScheduleModule.forRoot(), MatchModule],
	providers: [UpdateScoresTask, ImportMatchesTask],
})
export class ScheduleModule {}
