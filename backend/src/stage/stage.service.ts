import {
	getStageState,
	MatchStage,
	STAGE_DEADLINES,
	STAGE_EXPECTED_MATCHES,
	STAGE_ORDER,
	StageState,
	type StagePayload,
	type StageReadinessItem,
	findPredecessor,
} from '@bolao/shared'
import { Injectable, Logger, NotFoundException, OnModuleInit } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model, Types } from 'mongoose'

import { Match } from '../match/schemas/match.schema'
import { UpdateStageDto } from './dto/update-stage.dto'
import { Stage, StageDocument } from './schemas/stage.schema'

@Injectable()
export class StageService implements OnModuleInit {

	private readonly logger = new Logger(StageService.name)

	constructor(
		@InjectModel(Stage.name) private readonly model: Model<Stage>,
		@InjectModel(Match.name) private readonly matchModel: Model<Match>,
	) {}

	async onModuleInit() {
		const count = await this.model.estimatedDocumentCount().exec()
		if (count > 0) return

		await this.model.insertMany(Object.entries(STAGE_ORDER).map(([code, order]) => ({
			code: code as MatchStage,
			order,
			deadline: new Date(STAGE_DEADLINES[code as MatchStage]),
			expectedMatchCount: STAGE_EXPECTED_MATCHES[code as MatchStage],
		})))
		this.logger.log(`Initialized stage collection with ${Object.keys(STAGE_ORDER).length} stages`)
	}

	findAll() {
		return this.model.find().sort({ order: 1 }).exec()
	}

	findByCode(code: MatchStage) {
		return this.model.findOne({ code }).exec()
	}

	async list(): Promise<StagePayload[]> {
		const stages = await this.findAll()
		const now = new Date()
		const all = stages.map((s) => ({ code: s.code, deadline: s.deadline }))
		const importedCounts = await this.importedCounts(stages)
		return stages.map((s) => ({
			_id: s._id.toString(),
			code: s.code,
			order: s.order,
			state: getStageState({ code: s.code, deadline: s.deadline }, all, now),
			deadline: s.deadline.toISOString(),
			expectedMatchCount: s.expectedMatchCount,
			importedMatchCount: importedCounts.get(s._id.toString()) ?? 0,
		}))
	}

	async readiness(): Promise<StageReadinessItem[]> {
		const stages = await this.findAll()
		const now = new Date()
		const all = stages.map((s) => ({ code: s.code, deadline: s.deadline }))
		const importedCounts = await this.importedCounts(stages)
		return stages.map((s) => {
			const pred = findPredecessor(s.code, all)
			return {
				_id: s._id.toString(),
				code: s.code,
				order: s.order,
				state: getStageState({ code: s.code, deadline: s.deadline }, all, now),
				deadline: s.deadline.toISOString(),
				expectedMatchCount: s.expectedMatchCount,
				importedMatchCount: importedCounts.get(s._id.toString()) ?? 0,
				predecessor: pred
					? { code: pred.code, state: getStageState(pred, all, now) }
					: undefined,
			}
		})
	}

	private async importedCounts(stages: StageDocument[]): Promise<Map<string, number>> {
		const ids = stages.map((s) => s._id)
		const counts = await this.matchModel.aggregate<{ _id: Types.ObjectId; count: number }>([
			{ $match: { stage: { $in: ids } } },
			{ $group: { _id: '$stage', count: { $sum: 1 } } },
		])
		return new Map(counts.map((c) => [c._id.toString(), c.count]))
	}

	async getStateFor(stageId: Types.ObjectId | string, now: Date = new Date()): Promise<StageState> {
		const stages = await this.findAll()
		const target = stages.find((s) => s._id.toString() === stageId.toString())
		if (!target) return StageState.LOCKED
		const all = stages.map((s) => ({ code: s.code, deadline: s.deadline }))
		return getStageState({ code: target.code, deadline: target.deadline }, all, now)
	}

	async findStagesByState(state: StageState, now: Date = new Date()): Promise<StageDocument[]> {
		const stages = await this.findAll()
		const all = stages.map((s) => ({ code: s.code, deadline: s.deadline }))
		return stages.filter((s) => getStageState({ code: s.code, deadline: s.deadline }, all, now) === state)
	}

	async update(code: MatchStage, dto: UpdateStageDto): Promise<StageDocument> {
		const current = await this.findByCode(code)
		if (!current) throw new NotFoundException(`Fase ${code} não encontrada`)

		const $set: Record<string, unknown> = {}
		if (dto.deadline) $set.deadline = new Date(dto.deadline)
		if (typeof dto.expectedMatchCount === 'number') $set.expectedMatchCount = dto.expectedMatchCount

		const updated = await this.model.findOneAndUpdate({ code }, { $set }, { new: true }).exec()
		if (!updated) throw new NotFoundException(`Fase ${code} não encontrada`)

		this.logger.log(`Stage ${code} updated: ${JSON.stringify($set)}`)
		return updated
	}
}
