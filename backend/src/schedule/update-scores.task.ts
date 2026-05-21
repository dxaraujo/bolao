import { Injectable } from '@nestjs/common'
import { Cron } from '@nestjs/schedule'

import { ScoreService } from '../match/score.service'

@Injectable()
export class UpdateScoresTask {

	constructor(private readonly ScoreService: ScoreService) { }

	@Cron('*/5 7-20 * * *')
	async updateScores() {
		await this.ScoreService.updateScores()
	}
}
