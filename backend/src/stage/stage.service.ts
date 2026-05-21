import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'

import { UpdateStageDto } from './dto/update-stage.dto'
import { Stage, StageStatus } from './schemas/stage.schema'

@Injectable()
export class StageService {

	constructor(@InjectModel(Stage.name) private readonly model: Model<Stage>) { }

	findAll(query: Record<string, unknown>) {
		return this.model.find(query).exec()
	}

	findById(id: string) {
		return this.model.findById(id).exec()
	}

	async findBlockedStages(): Promise<string[]> {
		const stages = await this.model.find({ status: StageStatus.BLOCKED }).exec()
		return stages.map((s) => s.name)
	}

	async update(name: string, dto: UpdateStageDto) {
		const updated = await this.model.findOneAndUpdate({ name }, dto, { new: true }).exec()
		if (!updated) throw new NotFoundException(`Stage ${name} não encontrado`)
		return updated
	}
}
