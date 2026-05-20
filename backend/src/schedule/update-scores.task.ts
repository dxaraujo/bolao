import { Injectable } from '@nestjs/common'
import { Cron } from '@nestjs/schedule'

import { MatchUpdateScoreService } from '../match/match-update-score.service'

@Injectable()
export class UpdateScoresTask {

	constructor(private readonly matchUpdateScoreService: MatchUpdateScoreService) { }

	@Cron('*/5 7-20 * * *')
	async updateScores() {
		await this.matchUpdateScoreService.updateScores()
	}
}
