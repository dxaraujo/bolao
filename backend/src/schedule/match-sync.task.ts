import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common'
import { Cron } from '@nestjs/schedule'

import { LeaderboardService } from '../leaderboard/leaderboard.service'
import { MatchService } from '../match/match.service'
import { SystemStateService } from '../system-state/system-state.service'
import { TeamService } from '../team/team.service'

/**
 * Sincronização única do calendário + placares + leaderboard.
 * Roda 1x na subida do backend (times + partidas) e a cada 5 minutos.
 * Quando o import detecta mudanças, rebuilda o leaderboard.
 */
@Injectable()
export class MatchSyncTask implements OnApplicationBootstrap {
	private readonly logger = new Logger(MatchSyncTask.name)

	constructor(
		private readonly teamService: TeamService,
		private readonly matchService: MatchService,
		private readonly leaderboardService: LeaderboardService,
		private readonly systemState: SystemStateService,
	) {}

	async onApplicationBootstrap() {
		this.logger.log('Bootstrap sync starting (teams + matches)…')
		try {
			await this.teamService.importTeams()
			await this.runSync()
			this.logger.log('Bootstrap sync done')
		} catch (err) {
			this.logger.error('Bootstrap sync failed', err)
		}
	}

	@Cron('*/5 * * * *')
	async tick() {
		try {
			await this.runSync()
		} catch (err) {
			this.logger.error('Scheduled sync failed', err)
		}
	}

	private async runSync() {
		await this.systemState.scoreSyncStarted()
		try {
			const { changedIds } = await this.matchService.importMatches()
			await this.systemState.matchImported()
			if (changedIds.length > 0) {
				await this.leaderboardService.rebuild()
				await this.systemState.leaderboardRebuilt()
			}
		} finally {
			await this.systemState.scoreSyncCompleted()
		}
	}
}
