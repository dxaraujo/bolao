import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import * as path from 'node:path'

import { ConfigService } from '@nestjs/config'
import { downloadImage } from '../common/download'
import { UpdateTeamDto } from './dto/update-team.dto'
import { Team } from './schemas/team.schema'
import { nowtoLocalISOString } from '@bolao/shared'

interface FootballDataTeam {
	id: number
	name: string
	shortName: string
	tla: string
	crest: string
	lastUpdated: string
}

@Injectable()
export class TeamService {

	private readonly logger = new Logger(TeamService.name)
	private readonly apiUrl: string
	private readonly apiKey: string

	private readonly staticDir: string

	constructor(@InjectModel(Team.name) private readonly model: Model<Team>, private readonly config: ConfigService) {
		this.apiUrl = this.config.getOrThrow<string>('FOOTBALL_DATA_API_URL')
		this.apiKey = this.config.getOrThrow<string>('FOOTBALL_DATA_API_KEY')
		this.staticDir = path.resolve(process.cwd(), this.config.get<string>('STATIC_DIR') ?? 'static')
	}

	findAll() {
		return this.model.find().exec()
	}

	findByFootballDataTeamId(id: number) {
		return this.model.findOne({ footballDataId: id }).exec()
	}

	async update(id: string, dto: UpdateTeamDto) {
		const updated = await this.model.findByIdAndUpdate(id, dto, { new: true }).exec()
		if (!updated) {
			throw new NotFoundException(`Team ${id} not found`)
		}
		return updated
	}

	async importTeams() {

		this.logger.log(`Import teams started at: ${nowtoLocalISOString()}`)

		try {

			const response = await fetch(this.apiUrl + '/competitions/WC/teams?season=2026', { headers: { 'X-Auth-Token': this.apiKey } })

			if (!response.ok) {
				this.logger.warn(`Football Data API returned error: ${response.statusText}. Response: ${JSON.stringify(await response.json())}`)
				return
			}

			const data = await response.json()
			const teams = data.teams as FootballDataTeam[]
			this.logger.log(`Found ${teams.length} teams`)

			for (const externalTeam of teams) {

				const lastUpdated = new Date(externalTeam.lastUpdated)
				const registeredTeam = await this.model.findOne({ footballDataId: externalTeam.id }).exec()

				if (!registeredTeam) {
					const crest = await this.downloadCrest(externalTeam.tla, externalTeam.crest)
					await this.model.create({
						footballDataId: externalTeam.id,
						name: externalTeam.name,
						shortName: externalTeam.shortName,
						tla: externalTeam.tla,
						crest,
						lastUpdated,
					})
					this.logger.log(`Created team ${externalTeam.tla} (${externalTeam.id})`)
					continue
				}

				if (registeredTeam.lastUpdated && registeredTeam.lastUpdated >= lastUpdated) {
					this.logger.log(`Team ${externalTeam.tla} already up to date`)
					continue
				}

				const crest = await this.downloadCrest(externalTeam.tla, externalTeam.crest)
				await this.model.updateOne({ footballDataId: externalTeam.id }, {
					$set: {
						name: externalTeam.name,
						shortName: externalTeam.shortName,
						tla: externalTeam.tla,
						crest,
						lastUpdated,
					},
				}).exec()
				this.logger.log(`Updated team ${externalTeam.tla} (${externalTeam.id})`)
			}

			this.logger.log(`Finished importing teams at: ${nowtoLocalISOString()}`)

		} catch (err) {
			this.logger.error('Error importing teams', err)
		}
	}

	private async downloadCrest(tla: string, url: string): Promise<string> {
		const result = await downloadImage(url, path.join(this.staticDir, 'teams'), tla, '/static/teams')
		return result?.relativePath ?? url
	}
}
