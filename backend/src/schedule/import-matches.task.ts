import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Cron } from '@nestjs/schedule'

import { MatchService } from '../match/match.service'
import { TeamService } from '../team/team.service'

interface FootballDataMatch {
	id: number
	utcDate: string
	status: string
	matchday: number
	stage: string
	group: string
	homeTeam: { id: number }
	awayTeam: { id: number },
	lastUpdated: string
}

@Injectable()
export class ImportMatchesTask {

	private readonly logger = new Logger(ImportMatchesTask.name)
	private readonly apiUrl: string
	private readonly apiKey: string

	constructor(
		private readonly config: ConfigService,
		private readonly matchService: MatchService,
		private readonly teamService: TeamService,
	) {
		this.apiUrl = config.getOrThrow<string>('FOOTBALL_DATA_API_URL')
		this.apiKey = config.getOrThrow<string>('FOOTBALL_DATA_API_KEY')
	}

	@Cron('0 0 * * *')
	async importMatches() {

		this.logger.log(`Import matches started at: ${new Date().toISOString()}`)

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

			for (const externalMatch of matches) {

				const homeTeam = await this.teamService.findByFootballDataTeamId(externalMatch.homeTeam.id)
				const awayTeam = await this.teamService.findByFootballDataTeamId(externalMatch.awayTeam.id)

				if (!homeTeam) {
					this.logger.warn(`Home team ${externalMatch.homeTeam.id} not found for match ${externalMatch.id}`)
				}

				if (!awayTeam) {
					this.logger.warn(`Away team ${externalMatch.awayTeam.id} not found for match ${externalMatch.id}`)
				}

				await this.matchService.upsertByFootballDataMatchId(externalMatch.id, {
					id: externalMatch.id,
					utcDate: new Date(externalMatch.utcDate),
					status: externalMatch.status,
					matchday: externalMatch.matchday,
					stage: externalMatch.stage,
					group: externalMatch.group,
					homeTeam: homeTeam ?? undefined,
					awayTeam: awayTeam ?? undefined,
					lastUpdated: new Date(externalMatch.lastUpdated),
				})

				this.logger.log(`Imported match ${externalMatch.id}: ${homeTeam?.tla ?? '-'} x ${awayTeam?.tla ?? '-'}`)
			}

			this.logger.log(`Finished importing matches at: ${new Date().toISOString()}`)

		} catch (err) {
			this.logger.error('Erro ao importar partidas', err)
		}
	}
}
