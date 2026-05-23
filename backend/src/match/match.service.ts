import { Injectable, Logger } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model, Types } from 'mongoose'

import { MatchStage, MatchStatus, nowtoLocalISOString } from '@bolao/shared'
import { ConfigService } from '@nestjs/config'
import { StageService } from 'src/stage/stage.service'
import { TeamDocument } from 'src/team/schemas/team.schema'
import { TeamService } from 'src/team/team.service'
import { Match } from './schemas/match.schema'

interface FootballDataMatch {
	id: number
	utcDate: string
	status: MatchStatus
	stage: MatchStage
	group: string
	homeTeam: { id: number }
	awayTeam: { id: number }
	lastUpdated: string
}

@Injectable()
export class MatchService {

	private readonly logger = new Logger(MatchService.name)
	private readonly apiUrl: string
	private readonly apiKey: string

	constructor(
		@InjectModel(Match.name) private readonly model: Model<Match>,
		private readonly stageService: StageService,
		private readonly teamService: TeamService,
		private readonly config: ConfigService
	) {
		this.apiUrl = this.config.getOrThrow<string>('FOOTBALL_DATA_API_URL')
		this.apiKey = this.config.getOrThrow<string>('FOOTBALL_DATA_API_KEY')
	}

	async list() {
		const visibleStages = await this.stageService.findVisibleStages()
		const stageNames = visibleStages.map((s) => s.matchStage)
		const matches = await this.model.find({ stage: { $in: stageNames }, valid: true }).exec()
		return matches.sort((a, b) => a.utcDate.valueOf() - b.utcDate.valueOf() || a.footballDataId - b.footballDataId)
	}

	findIdsByStages(stageNames: string[]) {
		return this.model.find({ stage: { $in: stageNames }, valid: true }).distinct('_id').exec()
	}

	findByFootballDataMatchId(id: number) {
		return this.model.findOne({ footballDataId: id }).exec()
	}

	findById(id: string) {
		return this.model.findById(id).exec()
	}

	findByIds(ids: Types.ObjectId[]) {
		return this.model
			.find({ _id: { $in: ids } })
			.populate<{ homeTeam: TeamDocument; awayTeam: TeamDocument }>(['homeTeam', 'awayTeam'])
			.exec()
	}

	async importMatches() {

		this.logger.log(`Import matches started at: ${nowtoLocalISOString()}`)

		try {

			const response = await fetch(this.apiUrl + '/competitions/WC/matches?season=2026', { headers: { 'X-Auth-Token': this.apiKey } })

			if (!response.ok) {
				this.logger.warn(`Football Data API returned error: ${response.statusText}. Response: ${JSON.stringify(await response.json())}`)
				return
			}

			const data = await response.json()
			const matches = data.matches as FootballDataMatch[]
			this.logger.log(`Found ${matches.length} matches`)

			for (const externalMatch of matches) {

				const lastUpdated = new Date(externalMatch.lastUpdated)
				const homeTeam = await this.teamService.findByFootballDataTeamId(externalMatch.homeTeam.id)
				const awayTeam = await this.teamService.findByFootballDataTeamId(externalMatch.awayTeam.id)
				const valid = !!homeTeam && !!awayTeam

				const registeredMatch = await this.model.findOne({ footballDataId: externalMatch.id }).exec()

				const matchData = {
					footballDataId: externalMatch.id,
					utcDate: new Date(externalMatch.utcDate),
					status: externalMatch.status,
					stage: externalMatch.stage,
					group: externalMatch.group,
					homeTeam: homeTeam ? homeTeam._id : null,
					awayTeam: awayTeam ? awayTeam._id : null,
					valid,
					lastUpdated,
				}

				const label = `${homeTeam?.tla ?? 'TBD'} x ${awayTeam?.tla ?? 'TBD'}`

				if (!registeredMatch) {
					await this.model.create(matchData)
					this.logger.log(`Created match ${externalMatch.id} [${valid ? 'valid' : 'INVALID'}]: ${label}`)
					continue
				}

				if (registeredMatch.lastUpdated && registeredMatch.lastUpdated >= lastUpdated) {
					this.logger.debug(`Match ${externalMatch.id} already up to date`)
					continue
				}

				await this.model.updateOne({ footballDataId: externalMatch.id }, { $set: matchData }).exec()
				this.logger.log(`Updated match ${externalMatch.id} [${valid ? 'valid' : 'INVALID'}]: ${label}`)
			}

			this.logger.log(`Finished importing matches at: ${nowtoLocalISOString()}`)

			const matchStages = await this.model.distinct('stage')
			for (const matchStage of matchStages) {

				if (!await this.stageService.existsByMatchStage(matchStage)) {
					this.logger.log(`Stage ${matchStage} not found, creating...`)
					await this.stageService.create(matchStage)
					this.logger.log(`Created stage ${matchStage}`)
				}
			}

			this.logger.log(`Stage's creation completed at: ${nowtoLocalISOString()}`)

		} catch (err) {

			this.logger.error('Error importing matches', err)
		}
	}

	updateMatch(matchId: string, status: MatchStatus, homeTeamScore?: number, awayTeamScore?: number) {
		return this.model.findByIdAndUpdate(matchId, { status, homeTeamScore, awayTeamScore }, { new: true }).exec()
	}
}
