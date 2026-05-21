import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

import { MatchService } from './match.service'
import { ResultService } from './result.service'

interface FootballDataMatch {
	id: number
	status: string
	score: { fullTime: { home: number, away: number } }
}

@Injectable()
export class MatchUpdateScoreService {

	private readonly logger = new Logger(MatchUpdateScoreService.name)
	private readonly apiUrl: string
	private readonly apiKey: string

	constructor(
		private readonly config: ConfigService,
		private readonly matchService: MatchService,
		private readonly resultService: ResultService,
	) {
		this.apiUrl = config.getOrThrow<string>('FOOTBALL_DATA_API_URL')
		this.apiKey = config.getOrThrow<string>('FOOTBALL_DATA_API_KEY')
	}

	async updateScores() {

		this.logger.log('Update scores started at: {}', new Date().toISOString())

		try {

			const response = await fetch(this.apiUrl + '/competitions/WC/matches?season=2026', {
				headers: {
					'X-Auth-Token': this.apiKey,
				},
			})

			if (!response.ok) {
				this.logger.warn('Football Data API returned error: {}. Response: {}', response.statusText, await response.json())
				return
			}

			const data = await response.json()
			const matches = data.matches as FootballDataMatch[]
			this.logger.log('Found {} matches', matches.length)

			const finishedMatches = matches.filter((match) => match.status === 'FINISHED')
			this.logger.log('Found {} finished matches', finishedMatches.length)

			for (const finishedMatch of finishedMatches) {

				const homeTeamScore = finishedMatch.score.fullTime.home
				const awayTeamScore = finishedMatch.score.fullTime.away

				if (homeTeamScore == null || awayTeamScore == null || homeTeamScore < 0 || awayTeamScore < 0) {
					this.logger.warn('Invalid score for match {}: {} x {}', finishedMatch.id, homeTeamScore, awayTeamScore)
					continue
				}

				const registeredMatch = await this.matchService.findByFootballDataMatchId(finishedMatch.id)
				if (!registeredMatch) {
					this.logger.warn('Match {} not found', finishedMatch.id)
					continue
				}

				if (registeredMatch.homeTeamScore === homeTeamScore && registeredMatch.awayTeamScore === awayTeamScore) {
					this.logger.log('Match {} already has score: {} x {}', finishedMatch.id, homeTeamScore, awayTeamScore)
					continue
				}

				this.logger.log('Updating match {}: {} x {} → {} x {}',
					registeredMatch.homeTeam?.tla,
					registeredMatch.homeTeamScore ?? '-',
					registeredMatch.awayTeamScore ?? '-',
					registeredMatch.awayTeam?.tla,
					homeTeamScore,
					awayTeamScore)

				await this.resultService.atualizarResults(String(registeredMatch._id), { homeTeamScore, awayTeamScore })

				this.logger.log('Updated match {}: {} x {}', finishedMatch.id, homeTeamScore, awayTeamScore)
			}

			this.logger.log('Finished updating scores at: {}', new Date().toISOString())

		} catch (err) {
			this.logger.error('Error updating scores: {}', err)
		}
	}
}
