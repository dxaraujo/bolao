import { Module } from '@nestjs/common'
import { ScheduleModule as NestScheduleModule } from '@nestjs/schedule'

import { LeaderboardModule } from '../leaderboard/leaderboard.module'
import { MatchModule } from '../match/match.module'
import { SystemStateModule } from '../system-state/system-state.module'
import { TeamModule } from '../team/team.module'
import { MatchSyncTask } from './match-sync.task'

@Module({
	imports: [NestScheduleModule.forRoot(), MatchModule, LeaderboardModule, SystemStateModule, TeamModule],
	providers: [MatchSyncTask],
})
export class ScheduleModule {}
