import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'

import { UpdateStageDto } from './dto/update-stage.dto'
import { Stage, StageStatus } from './schemas/stage.schema'

@Injectable()
export class StageService {

	constructor(@InjectModel(Stage.name) private readonly model: Model<Stage>) { }

	findAll() {
		return this.model.find().exec()
	}

	findVisibleStages() {
		return this.model.find({ status: { $in: [StageStatus.OPEN, StageStatus.BLOCKED] }  }).exec()
	}

	async findBlockedStages(): Promise<string[]> {
		const stages = await this.model.find({ status: StageStatus.BLOCKED }).exec()
		return stages.map(stage => stage.matchStage)
	}

	async update(matchStage: string, dto: UpdateStageDto) {
		const updated = await this.model.findOneAndUpdate({ matchStage }, dto, { new: true }).exec()
		if (!updated) {
			throw new NotFoundException(`Stage ${matchStage} not found`)
		}
		return updated
	}
}
