import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'

import { Team } from './schemas/team.schema'

interface FootballDataTeam {
	id: number
	name: string
	shortName: string
	tla: string
	crest: string
	lastUpdated: string
}

@Injectable()
export class TeamImportService {

	private readonly logger = new Logger(TeamImportService.name)
	private readonly apiUrl: string
	private readonly apiKey: string

	constructor(
		@InjectModel(Team.name) private readonly model: Model<Team>,
		private readonly config: ConfigService,
	) {
		this.apiUrl = config.getOrThrow<string>('FOOTBALL_DATA_API_URL')
		this.apiKey = config.getOrThrow<string>('FOOTBALL_DATA_API_KEY')
	}

	async importTeams() {

		this.logger.log('Import teams started at: {}', new Date().toISOString())

		try {

			const response = await fetch(this.apiUrl + '/competitions/WC/teams?season=2026', {
				headers: {
					'X-Auth-Token': this.apiKey,
				},
			})

			if (!response.ok) {
				this.logger.warn('Football Data API returned error: {}. Response: {}', response.statusText, await response.json())
				return
			}

			const data = await response.json()
			const teams = data.teams as FootballDataTeam[]
			this.logger.log('Found {} teams', teams.length)

			for (const externalTeam of teams) {

				const lastUpdated = new Date(externalTeam.lastUpdated)
				const registeredTeam = await this.model.findOne({ id: externalTeam.id }).exec()

				if (!registeredTeam) {
					await this.model.create({
						id: externalTeam.id,
						name: externalTeam.name,
						shortName: externalTeam.shortName,
						tla: externalTeam.tla,
						crest: externalTeam.crest,
						lastUpdated,
					})
					this.logger.log('Created team {}: ({})', externalTeam.tla, externalTeam.id)
					continue
				}

				if (registeredTeam.lastUpdated && registeredTeam.lastUpdated >= lastUpdated) {
					this.logger.log('Team {} already up to date', externalTeam.tla)
					continue
				}

				await this.model.updateOne({ id: externalTeam.id }, {
					$set: {
						name: externalTeam.name,
						shortName: externalTeam.shortName,
						tla: externalTeam.tla,
						crest: externalTeam.crest,
						lastUpdated,
					},
				}).exec()
				this.logger.log('Updated team {}: ({})', externalTeam.tla, externalTeam.id)
			}

			this.logger.log('Finished importing teams at: {}', new Date().toISOString())

		} catch (err) {
			this.logger.error('Error importing teams: {}', err)
		}
	}
}
