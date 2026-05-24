import { Module } from '@nestjs/common'
import { ScheduleModule as NestScheduleModule } from '@nestjs/schedule'

import { LeaderboardModule } from '../leaderboard/leaderboard.module'
import { MatchModule } from '../match/match.module'
import { SystemStateModule } from '../system-state/system-state.module'
import { MatchImportTask } from './match-import.task'
import { MatchSyncTask } from './match-sync.task'

@Module({
	imports: [NestScheduleModule.forRoot(), MatchModule, LeaderboardModule, SystemStateModule],
	providers: [MatchSyncTask, MatchImportTask],
})
export class ScheduleModule {}
