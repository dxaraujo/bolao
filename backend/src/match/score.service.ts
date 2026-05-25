import { Injectable, Logger } from '@nestjs/common'
import { Types } from 'mongoose'

import { nowtoLocalISOString } from '@bolao/shared'
import { MatchService } from './match.service'

@Injectable()
export class ScoreService {
	private readonly logger = new Logger(ScoreService.name)

	constructor(private readonly matchService: MatchService) {}

	/**
	 * Reimporta o calendário e devolve as partidas com mudanças (score/status).
	 * O orquestrador (MatchSyncTask) dispara LeaderboardService.rebuild() quando há mudanças.
	 */
	async syncScores(): Promise<{ changedIds: Types.ObjectId[] }> {
		this.logger.log(`Score sync started at: ${nowtoLocalISOString()}`)
		const { changedIds } = await this.matchService.importMatches()
		this.logger.log(`Score sync finished — ${changedIds.length} match(es) changed`)
		return { changedIds }
	}
}
