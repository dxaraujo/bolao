import { Injectable, Logger } from '@nestjs/common'
import { Cron } from '@nestjs/schedule'

import { MatchService } from '../match/match.service'
import { SystemStateService } from '../system-state/system-state.service'

/**
 * Reimporta o calendário a cada 15 minutos. Faz pouco trabalho na maior parte do tempo;
 * importante para captar novas partidas eliminatórias assim que o sorteio sai.
 */
@Injectable()
export class MatchImportTask {
	private readonly logger = new Logger(MatchImportTask.name)

	constructor(
		private readonly matchService: MatchService,
		private readonly systemState: SystemStateService,
	) {}

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
