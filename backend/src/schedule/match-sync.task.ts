import { Injectable, Logger } from '@nestjs/common'
import { Cron } from '@nestjs/schedule'

import { LeaderboardService } from '../leaderboard/leaderboard.service'
import { ScoreService } from '../match/score.service'
import { SystemStateService } from '../system-state/system-state.service'

/**
 * Sincronização de placares 24/7 a cada 5 minutos.
 * Quando há partidas alteradas, rebuilda o leaderboard.
 */
@Injectable()
export class MatchSyncTask {
	private readonly logger = new Logger(MatchSyncTask.name)

	constructor(
		private readonly scoreService: ScoreService,
		private readonly leaderboardService: LeaderboardService,
		private readonly systemState: SystemStateService,
	) {}

	@Cron('*/5 * * * *')
	async sync() {
		await this.systemState.scoreSyncStarted()
		try {
			const { changedIds } = await this.scoreService.syncScores()
			if (changedIds.length > 0) {
				await this.leaderboardService.rebuild()
				await this.systemState.leaderboardRebuilt()
			}
		} catch (err) {
			this.logger.error('Match sync failed', err)
		} finally {
			await this.systemState.scoreSyncCompleted()
		}
	}
}
