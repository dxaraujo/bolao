import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { InjectModel } from '@nestjs/mongoose'
import { Model, Types } from 'mongoose'

import { isCanonicalTransition, mapExternalStatus, MatchStatus, nowtoLocalISOString } from '@bolao/shared'

import { Stage, StageDocument } from '../stage/schemas/stage.schema'
import { Team } from '../team/schemas/team.schema'
import { TeamService } from '../team/team.service'
import { Match, MatchDocument } from './schemas/match.schema'

interface FootballDataMatch {
	id: number
	utcDate: string
	status: string
	stage: string
	group?: string
	homeTeam: { id: number; tla?: string }
	awayTeam: { id: number; tla?: string }
	lastUpdated: string
	score?: { fullTime?: { home: number | null; away: number | null } }
}

export interface MatchSyncResult {
	changedIds: Types.ObjectId[]
	imported: number
	skipped: number
}

@Injectable()
export class MatchService {
	private readonly logger = new Logger(MatchService.name)
	private readonly apiUrl: string
	private readonly apiKey: string

	constructor(
		@InjectModel(Match.name) private readonly model: Model<Match>,
		@InjectModel(Stage.name) private readonly stageModel: Model<Stage>,
		private readonly teamService: TeamService,
		private readonly config: ConfigService,
	) {
		this.apiUrl = this.config.getOrThrow<string>('FOOTBALL_DATA_API_URL')
		this.apiKey = this.config.getOrThrow<string>('FOOTBALL_DATA_API_KEY')
	}

	findById(id: string) {
		return this.model.findById(id).exec()
	}

	findByIds(ids: Types.ObjectId[]) {
		return this.model
			.find({ _id: { $in: ids } })
			.populate<{ homeTeam: Team; awayTeam: Team }>(['homeTeam', 'awayTeam'])
			.exec()
	}

	listAll() {
		return this.model
			.find()
			.sort({ utcDate: 1, footballDataId: 1 })
			.populate<{ homeTeam: Team; awayTeam: Team }>(['homeTeam', 'awayTeam'])
			.populate<{ stage: StageDocument }>('stage')
			.exec()
	}

	async listByStages(stageIds: Types.ObjectId[]) {
		return this.model
			.find({ stage: { $in: stageIds } })
			.sort({ utcDate: 1, footballDataId: 1 })
			.populate<{ homeTeam: Team; awayTeam: Team }>(['homeTeam', 'awayTeam'])
			.populate<{ stage: StageDocument }>('stage')
			.exec()
	}

	/**
	 * Importa o calendário. Partidas com algum team não-resolvido (TBD) são SKIPADAS.
	 */
	async importMatches(): Promise<MatchSyncResult> {
		this.logger.log(`Import matches started at: ${nowtoLocalISOString()}`)
		const result: MatchSyncResult = { changedIds: [], imported: 0, skipped: 0 }

		try {
			const response = await fetch(this.apiUrl + '/competitions/WC/matches?season=2026', {
				headers: { 'X-Auth-Token': this.apiKey },
			})
			if (!response.ok) {
				this.logger.warn(`Football Data API error: ${response.statusText}`)
				return result
			}

			const data = await response.json()
			const matches = data.matches as FootballDataMatch[]

			const stages = await this.stageModel.find().exec()
			const stageIdByCode = new Map(stages.map((s) => [s.code, s._id]))

			for (const ext of matches) {
				const stageId = stageIdByCode.get(ext.stage as never)
				if (!stageId) {
					result.skipped++
					continue
				}

				const home = await this.teamService.findByFootballDataId(ext.homeTeam.id)
				const away = await this.teamService.findByFootballDataId(ext.awayTeam.id)
				if (!home || !away) {
					result.skipped++
					continue
				}

				const externalLastUpdated = new Date(ext.lastUpdated)
				const status = mapExternalStatus(ext.status)
				const score = extractScore(ext, status)

				const existing = await this.model.findOne({ footballDataId: ext.id }).exec()

				if (existing && isCanonicalTransition(existing.status, status) === false) {
					this.logger.warn(`Non-canonical status transition for match ${ext.id}: ${existing.status} → ${status} (external: ${ext.status})`)
				}

				const $set: Record<string, unknown> = {
					footballDataId: ext.id,
					utcDate: new Date(ext.utcDate),
					status,
					stage: stageId,
					group: ext.group,
					homeTeam: home._id,
					awayTeam: away._id,
					externalLastUpdated,
				}

				if (score) $set.score = score

				if (!existing) {
					const created = await this.model.create({ ...$set, score })
					result.changedIds.push(created._id)
					result.imported++
				} else if (hasChanged(existing, { ...$set, score })) {
					const update: Record<string, unknown> = { $set }
					if (!score && existing.score) update.$unset = { score: 1 }
					await this.model.updateOne({ _id: existing._id }, update).exec()
					result.changedIds.push(existing._id)
					result.imported++
				}
			}

			this.logger.log(`Import done: ${result.imported} imported/updated, ${result.skipped} skipped (TBD or unknown stage)`)
			return result
		} catch (err) {
			this.logger.error('Error importing matches', err)
			return result
		}
	}
}

function extractScore(ext: FootballDataMatch, status: MatchStatus) {
	if (status === MatchStatus.SCHEDULED || status === MatchStatus.CANCELLED) return undefined
	const full = ext.score?.fullTime
	if (!full || full.home == null || full.away == null) return undefined
	if (full.home < 0 || full.away < 0) return undefined
	return { home: full.home, away: full.away }
}

function hasChanged(existing: MatchDocument, $set: Record<string, any>): boolean {
	const scoreDiff = ($set.score?.home ?? null) !== (existing.score?.home ?? null) || ($set.score?.away ?? null) !== (existing.score?.away ?? null)
	return existing.status !== $set.status || scoreDiff || existing.utcDate.getTime() !== $set.utcDate.getTime()
}
