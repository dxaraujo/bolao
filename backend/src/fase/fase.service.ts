import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'

import { CreateFaseDto } from './dto/create-fase.dto'
import { UpdateFaseDto } from './dto/update-fase.dto'
import { Fase } from './schemas/fase.schema'

@Injectable()
export class FaseService {
	constructor(@InjectModel(Fase.name) private readonly model: Model<Fase>) {}

	findAll(query: Record<string, unknown>) {
		return this.model.find(query).exec()
	}

	findById(id: string) {
		return this.model.findById(id).exec()
	}

	create(dto: CreateFaseDto) {
		return this.model.create(dto)
	}

	async update(id: string, dto: UpdateFaseDto) {
		const updated = await this.model.findByIdAndUpdate(id, dto, { new: true }).exec()
		if (!updated) throw new NotFoundException(`Fase ${id} não encontrada`)
		return updated
	}

	async remove(id: string) {
		const removed = await this.model.findByIdAndDelete(id).exec()
		if (!removed) throw new NotFoundException(`Fase ${id} não encontrada`)
		return removed
	}
}
