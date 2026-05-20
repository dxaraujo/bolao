import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Cron } from '@nestjs/schedule'

import { MatchService } from '../match/match.service'
import { ResultService } from '../match/result.service'

interface FootballDataMatch {
	id: number
	status: string
	score: { fullTime: { home: number, away: number } }
}

@Injectable()
export class UpdateScoresTask {

	private readonly logger = new Logger(UpdateScoresTask.name)
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

	@Cron('*/5 7-20 * * *')
	async updateScores() {

		this.logger.log(`Update scores started at: ${new Date().toISOString()}`)

		try {

			const response = await fetch(this.apiUrl + '/competitions/WC/matches?season=2026', {
				headers: {
					'X-Auth-Token': this.apiKey,
				},
			})

			if (!response.ok) {
				this.logger.warn(`Football Data API returned error: ${response.statusText}`)
				return
			}

			const data = await response.json()
			const matches = data.matches as FootballDataMatch[]
			this.logger.log(`Found ${matches.length} matches`)

			const finishedMatches = matches.filter((match) => match.status === 'FINISHED')
			this.logger.log(`Found ${finishedMatches.length} finished matches`)

			for (const finishedMatch of finishedMatches) {

				const homeTeamScore = finishedMatch.score.fullTime.home
				const awayTeamScore = finishedMatch.score.fullTime.away

				if (homeTeamScore == null || awayTeamScore == null || homeTeamScore < 0 || awayTeamScore < 0) {
					this.logger.warn(`Invalid score for match ${finishedMatch.id}: ${homeTeamScore} x ${awayTeamScore}`)
					continue
				}

				const registeredMatch = await this.matchService.findByFootballDataMatchId(finishedMatch.id)
				if (!registeredMatch) {
					this.logger.warn(`Match ${finishedMatch.id} not found`)
					continue
				}

				if (registeredMatch.homeTeamScore === homeTeamScore && registeredMatch.awayTeamScore === awayTeamScore) {
					this.logger.log(`Match ${finishedMatch.id} already has score: ${homeTeamScore} x ${awayTeamScore}`)
					continue
				}

				this.logger.log(`Updating match ${registeredMatch.homeTeam?.tla} ${registeredMatch.homeTeamScore ?? '-'} x ` + `${registeredMatch.awayTeamScore ?? '-'} ${registeredMatch.awayTeam?.tla} → ${homeTeamScore} x ${awayTeamScore}`)

				await this.resultService.atualizarResults(String(registeredMatch._id), { homeTeamScore, awayTeamScore })

				this.logger.log(`Updated match ${finishedMatch.id} with score: ${homeTeamScore} x ${awayTeamScore}`)
			}

			this.logger.log(`Finished updating scores at: ${new Date().toISOString()}`)

		} catch (err) {
			this.logger.error('Erro ao sincronizar resultados', err)
		}
	}
}
