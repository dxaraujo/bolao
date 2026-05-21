import { Injectable, Logger } from '@nestjs/common'
import { Cron } from '@nestjs/schedule'

import { MatchService } from '../match/match.service'

@Injectable()
export class ImportMatchesTask {

	private readonly logger = new Logger(ImportMatchesTask.name)

	constructor(private readonly matchService: MatchService) { }

	@Cron('0 0 * * *')
	async importMatches() {
		await this.matchService.importMatches()
	}
}
