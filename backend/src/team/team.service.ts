import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'

import { nowtoLocalISOString, tlaToFlagEmoji } from '@bolao/shared'
import { MediaService } from '../media/media.service'
import { UpdateTeamDto } from './dto/update-team.dto'
import { Team, TeamDocument } from './schemas/team.schema'

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

	constructor(
		@InjectModel(Team.name) private readonly model: Model<Team>,
		private readonly config: ConfigService,
		private readonly media: MediaService,
	) {
		this.apiUrl = this.config.getOrThrow<string>('FOOTBALL_DATA_API_URL')
		this.apiKey = this.config.getOrThrow<string>('FOOTBALL_DATA_API_KEY')
	}

	findAll() {
		return this.model.find().sort({ name: 1 }).exec()
	}

	findByFootballDataId(id: number) {
		return this.model.findOne({ footballDataId: id }).exec()
	}

	async update(id: string, dto: UpdateTeamDto): Promise<TeamDocument> {
		const updated = await this.model.findByIdAndUpdate(id, dto, { new: true }).exec()
		if (!updated) throw new NotFoundException(`Time ${id} não encontrado`)
		return updated
	}

	async importTeams() {
		this.logger.log(`Import teams started at: ${nowtoLocalISOString()}`)
		try {
			const response = await fetch(this.apiUrl + '/competitions/WC/teams?season=2026', {
				headers: { 'X-Auth-Token': this.apiKey },
			})
			if (!response.ok) {
				this.logger.warn(`Football Data API error: ${response.statusText}`)
				return
			}
			const data = await response.json()
			const teams = data.teams as FootballDataTeam[]
			this.logger.log(`Found ${teams.length} teams`)

			for (const ext of teams) {
				const externalLastUpdated = new Date(ext.lastUpdated)
				const flagEmoji = tlaToFlagEmoji(ext.tla) ?? undefined

				const existing = await this.model.findOne({ footballDataId: ext.id }).exec()

				let crest: string | undefined = existing?.crest
				const needsCrestDownload = !flagEmoji && (!existing?.crest || !(await this.media.isLocalAvailable(existing.crest)))
				if (needsCrestDownload && ext.crest) {
					const downloaded = await this.media.downloadTeamCrest(ext.tla, ext.crest)
					if (downloaded) crest = downloaded
				}

				const $set = {
					footballDataId: ext.id,
					name: ext.name,
					shortName: ext.shortName,
					tla: ext.tla,
					flagEmoji,
					crest,
					externalLastUpdated,
				}

				if (!existing) {
					await this.model.create($set)
					this.logger.log(`Created team ${ext.tla} (${ext.id}) ${flagEmoji ?? ''}`)
				} else {
					await this.model.updateOne({ _id: existing._id }, { $set }).exec()
				}
			}
			this.logger.log(`Finished importing teams at: ${nowtoLocalISOString()}`)
		} catch (err) {
			this.logger.error('Error importing teams', err)
		}
	}
}
