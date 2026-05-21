import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { subHours } from 'date-fns'
import { Model } from 'mongoose'

import { CreateMatchDto } from './dto/create-match.dto'
import { UpdateMatchDto } from './dto/update-match.dto'
import { Match } from './schemas/match.schema'

@Injectable()
export class MatchService {

	constructor(@InjectModel(Match.name) private readonly model: Model<Match>) { }

	findAll(query: Record<string, unknown>) {
		return this.model.find(query).sort({ order: 'asc' }).exec()
	}

	findResultados() {
		const limite = subHours(new Date(), 3)
		return this.model.find({ utcDate: { $lt: limite } }).sort({ order: 'asc' }).exec()
	}

	findById(id: string) {
		return this.model.findById(id).exec()
	}


	findIdsByStages(stageNames: string[]) {
		return this.model.find({ stage: { $in: stageNames } }).distinct('_id').exec()
	}

	findByStage(stageName: string) {
		return this.model.find({ stage: stageName }).sort({ utcDate: 'asc' }).exec()
	}

	findByFootballDataMatchId(id: number) {
		return this.model.findOne({ footballDataId: id }).exec()
	}

	create(dto: CreateMatchDto) {
		return this.model.create(dto)
	}

	upsertByFootballDataMatchId(id: number, dto: CreateMatchDto) {
		return this.model.findOneAndUpdate({ footballDataId: id }, { $set: dto }, { new: true, upsert: true }).exec()
	}

	async update(id: string, dto: UpdateMatchDto) {
		const updated = await this.model.findByIdAndUpdate(id, dto, { new: true }).exec()
		if (!updated) throw new NotFoundException(`Match ${id} não encontrada`)
		return updated
	}

	async remove(id: string) {
		const removed = await this.model.findByIdAndDelete(id).exec()
		if (!removed) throw new NotFoundException(`Match ${id} não encontrada`)
		return removed
	}
}
