import { Injectable, Logger } from '@nestjs/common'
import { Cron } from '@nestjs/schedule'

import { MatchImportService } from '../match/match-import.service'

@Injectable()
export class ImportMatchesTask {

	private readonly logger = new Logger(ImportMatchesTask.name)

	constructor(private readonly matchImportService: MatchImportService) { }

	@Cron('0 0 * * *')
	async importMatches() {
		await this.matchImportService.importMatches()
	}
}
