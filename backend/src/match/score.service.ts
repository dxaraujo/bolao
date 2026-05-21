import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

import { MatchStatus, nowtoLocalISOString } from '@bolao/shared'
import { MatchService } from './match.service'
import { ResultService } from './result.service'

interface FootballDataMatch {
	id: number
	utcDate: string
	status: MatchStatus
	score: { fullTime: { home: number, away: number } }
}

@Injectable()
export class ScoreService {

	private readonly logger = new Logger(ScoreService.name)
	private readonly apiUrl: string
	private readonly apiKey: string

	constructor(
		private readonly config: ConfigService,
		private readonly matchService: MatchService,
		private readonly resultService: ResultService,
	) {
		this.apiUrl = this.config.getOrThrow<string>('FOOTBALL_DATA_API_URL')
		this.apiKey = this.config.getOrThrow<string>('FOOTBALL_DATA_API_KEY')
	}

	async updateScores() {

		try {

			this.logger.log(`Find matches to update results at: ${nowtoLocalISOString()}`)

			const response = await fetch(this.apiUrl + '/competitions/WC/matches?season=2026', { headers: { 'X-Auth-Token': this.apiKey } })

			if (!response.ok) {
				this.logger.warn(`Football Data API returned error: ${response.statusText}. Response: ${JSON.stringify(await response.json())}`)
				return
			}

			const data = await response.json()
			const matches = data.matches as FootballDataMatch[]
			this.logger.log(`Found ${matches.length} matches`)

			const now = new Date()
			const startedMatches = matches.filter((match) => now >= new Date(match.utcDate))
			this.logger.log(`Found ${startedMatches.length} started matches`)

			for (const startedMatche of startedMatches) {

				const homeTeamScore = startedMatche.score.fullTime.home
				const awayTeamScore = startedMatche.score.fullTime.away
				const status = startedMatche.status

				if (homeTeamScore == null || awayTeamScore == null || homeTeamScore < 0 || awayTeamScore < 0) {
					this.logger.warn(`Invalid score for match ${startedMatche.id}: ${homeTeamScore} x ${awayTeamScore}`)
					continue
				}

				const registeredMatch = await this.matchService.findByFootballDataMatchId(startedMatche.id)
				if (!registeredMatch) {
					this.logger.warn(`Match ${startedMatche.id} not found`)
					continue
				}

				if (registeredMatch.status === MatchStatus.FINISHED) {
					this.logger.log(`Match ${startedMatche.id} is already finished`)
					continue
				}

				if (registeredMatch.homeTeamScore === homeTeamScore && registeredMatch.awayTeamScore === awayTeamScore) {
					this.logger.log(`Match ${startedMatche.id} already has score: ${homeTeamScore} x ${awayTeamScore}`)
					continue
				}

				this.logger.log(`Updating match ${startedMatche.id}: ${registeredMatch.homeTeamScore ?? '-'} x ${registeredMatch.awayTeamScore ?? '-'} → ${homeTeamScore} x ${awayTeamScore}`,)
				await this.matchService.updateMatch(String(registeredMatch._id), { status, homeTeamScore, awayTeamScore })
			}

			this.logger.log(`Updating results at: ${nowtoLocalISOString()}`)
			await this.resultService.updateResults()

			this.logger.log(`Finished updating results at: ${nowtoLocalISOString()}`)

		} catch (err) {
			this.logger.error('Error updating results', err)
		}
	}
}
