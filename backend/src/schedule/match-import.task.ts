import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common'
import { Cron } from '@nestjs/schedule'

import { MatchService } from '../match/match.service'
import { SystemStateService } from '../system-state/system-state.service'
import { TeamService } from '../team/team.service'

/**
 * Reimporta o calendário a cada 15 minutos. Faz pouco trabalho na maior parte do tempo;
 * importante para captar novas partidas eliminatórias assim que o sorteio sai.
 * Também roda 1x na subida do backend (times + partidas)
 */
@Injectable()
export class MatchImportTask implements OnApplicationBootstrap {
	private readonly logger = new Logger(MatchImportTask.name)

	constructor(
		private readonly teamService: TeamService,
		private readonly matchService: MatchService,
		private readonly systemState: SystemStateService,
	) {}

	async onApplicationBootstrap() {
		this.logger.log('Bootstrap import starting (teams + matches)…')
		try {
			await this.teamService.importTeams()
			await this.matchService.importMatches()
			await this.systemState.matchImported()
			this.logger.log('Bootstrap import done')
		} catch (err) {
			this.logger.error('Bootstrap import failed', err)
		}
	}

	@Cron('*/15 * * * *')
	async import() {
		try {
			await this.matchService.importMatches()
			await this.systemState.matchImported()
		} catch (err) {
			this.logger.error('Match import failed', err)
		}
	}
}
