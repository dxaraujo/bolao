import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'

import { CreatePhaseDto } from './dto/create-phase.dto'
import { UpdatePhaseDto } from './dto/update-phase.dto'
import { Phase } from './schemas/phase.schema'

@Injectable()
export class PhaseService {

	constructor(@InjectModel(Phase.name) private readonly model: Model<Phase>) { }

	findAll(query: Record<string, unknown>) {
		return this.model.find(query).exec()
	}

	findById(id: string) {
		return this.model.findById(id).exec()
	}

	create(dto: CreatePhaseDto) {
		return this.model.create(dto)
	}

	async update(id: string, dto: UpdatePhaseDto) {
		const updated = await this.model.findByIdAndUpdate(id, dto, { new: true }).exec()
		if (!updated) throw new NotFoundException(`Phase ${id} não encontrada`)
		return updated
	}

	async remove(id: string) {
		const removed = await this.model.findByIdAndDelete(id).exec()
		if (!removed) throw new NotFoundException(`Phase ${id} não encontrada`)
		return removed
	}
}
