import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'

import { TeamService } from '../team/team.service'
import { Match } from './schemas/match.schema'

interface FootballDataMatch {
	id: number
	utcDate: string
	status: string
	matchday: number
	stage: string
	group: string
	homeTeam: { id: number }
	awayTeam: { id: number }
	lastUpdated: string
}

@Injectable()
export class MatchImportService {

	private readonly logger = new Logger(MatchImportService.name)
	private readonly apiUrl: string
	private readonly apiKey: string

	constructor(
		@InjectModel(Match.name) private readonly model: Model<Match>,
		private readonly config: ConfigService,
		private readonly teamService: TeamService,
	) {
		this.apiUrl = config.getOrThrow<string>('FOOTBALL_DATA_API_URL')
		this.apiKey = config.getOrThrow<string>('FOOTBALL_DATA_API_KEY')
	}

	async importMatches() {

		this.logger.log(`Import matches started at: ${new Date().toISOString()}`)

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

			for (const externalMatch of matches) {

				const lastUpdated = new Date(externalMatch.lastUpdated)
				const homeTeam = await this.teamService.findByFootballDataTeamId(externalMatch.homeTeam.id)
				const awayTeam = await this.teamService.findByFootballDataTeamId(externalMatch.awayTeam.id)

				if (!homeTeam) {
					this.logger.warn('Home team {} not found for match {}', externalMatch.homeTeam.id, externalMatch.id)
				}

				if (!awayTeam) {
					this.logger.warn('Away team {} not found for match {}', externalMatch.awayTeam.id, externalMatch.id)
				}

				const registeredMatch = await this.model.findOne({ id: externalMatch.id }).exec()

				const matchData = {
					id: externalMatch.id,
					utcDate: new Date(externalMatch.utcDate),
					status: externalMatch.status,
					matchday: externalMatch.matchday,
					stage: externalMatch.stage,
					group: externalMatch.group,
					homeTeam: homeTeam,
					awayTeam: awayTeam,
					lastUpdated,
				}

				if (!registeredMatch) {
					await this.model.create(matchData)
					this.logger.log('Created match {}: {} x {}', externalMatch.id, homeTeam?.tla ?? '-', awayTeam?.tla ?? '-')
					continue
				}

				if (registeredMatch.lastUpdated && registeredMatch.lastUpdated >= lastUpdated) {
					this.logger.log('Match {} already up to date', externalMatch.id)
					continue
				}

				await this.model.updateOne({ id: externalMatch.id }, { $set: matchData }).exec()
				this.logger.log('Updated match {}: {} x {}', externalMatch.id, homeTeam?.tla ?? '-', awayTeam?.tla ?? '-')
			}

			this.logger.log('Finished importing matches at: {}', new Date().toISOString())

		} catch (err) {

			this.logger.error('Error importing matches: {}', err)
		}
	}
}
