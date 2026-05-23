import { Injectable, Logger } from '@nestjs/common'
import { Cron } from '@nestjs/schedule'

import { StageService } from '../stage/stage.service'

@Injectable()
export class BlockStagesTask {

	private readonly logger = new Logger(BlockStagesTask.name)

	constructor(private readonly stageService: StageService) { }

	@Cron('* * * * *')
	async blockExpiredStages() {
		try {
			await this.stageService.blockExpiredStages()
		} catch (err) {
			this.logger.error('Error blocking expired stages', err)
		}
	}
}
