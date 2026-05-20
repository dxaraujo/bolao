import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'

import { CreateTimeDto } from './dto/create-time.dto'
import { UpdateTimeDto } from './dto/update-time.dto'
import { Time } from './schemas/time.schema'

@Injectable()
export class TimeService {
	constructor(@InjectModel(Time.name) private readonly model: Model<Time>) {}

	findAll(query: Record<string, unknown>) {
		return this.model.find(query).exec()
	}

	findById(id: string) {
		return this.model.findById(id).exec()
	}

	create(dto: CreateTimeDto) {
		return this.model.create(dto)
	}

	async update(id: string, dto: UpdateTimeDto) {
		const updated = await this.model.findByIdAndUpdate(id, dto, { new: true }).exec()
		if (!updated) throw new NotFoundException(`Time ${id} não encontrado`)
		return updated
	}

	async remove(id: string) {
		const removed = await this.model.findByIdAndDelete(id).exec()
		if (!removed) throw new NotFoundException(`Time ${id} não encontrado`)
		return removed
	}
}
