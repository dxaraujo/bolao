import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { subHours } from 'date-fns'
import { Model } from 'mongoose'

import { CreatePartidaDto } from './dto/create-partida.dto'
import { UpdatePartidaDto } from './dto/update-partida.dto'
import { Partida } from './schemas/partida.schema'

@Injectable()
export class PartidaService {
	constructor(@InjectModel(Partida.name) private readonly model: Model<Partida>) {}

	findAll(query: Record<string, unknown>) {
		return this.model.find(query).sort({ order: 'asc' }).exec()
	}

	findResultados() {
		const limite = subHours(new Date(), 3)
		return this.model.find({ data: { $lt: limite } }).sort({ order: 'asc' }).exec()
	}

	findById(id: string) {
		return this.model.findById(id).exec()
	}

	create(dto: CreatePartidaDto) {
		return this.model.create(dto)
	}

	async update(id: string, dto: UpdatePartidaDto) {
		const updated = await this.model.findByIdAndUpdate(id, dto, { new: true }).exec()
		if (!updated) throw new NotFoundException(`Partida ${id} não encontrada`)
		return updated
	}

	async remove(id: string) {
		const removed = await this.model.findByIdAndDelete(id).exec()
		if (!removed) throw new NotFoundException(`Partida ${id} não encontrada`)
		return removed
	}
}
