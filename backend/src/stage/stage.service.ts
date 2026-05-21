import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'

import { BetService } from 'src/bet/bet.service'
import { UpdateStageDto } from './dto/update-stage.dto'
import { Stage, StageStatus } from './schemas/stage.schema'

@Injectable()
export class StageService {

	constructor(@InjectModel(Stage.name) private readonly model: Model<Stage>, private readonly betService: BetService) { }

	findAll() {
		return this.model.find().exec()
	}

	findVisibleStages() {
		return this.model.find({ status: { $in: [StageStatus.OPEN, StageStatus.BLOCKED] } }).exec()
	}

	async findBlockedStages(): Promise<string[]> {
		const stages = await this.model.find({ status: StageStatus.BLOCKED }).exec()
		return stages.map(stage => stage.matchStage)
	}

	async findOpenStages(): Promise<string[]> {
		const stages = await this.model.find({ status: StageStatus.OPEN }).exec()
		return stages.map((s) => s.matchStage)
	}

	async update(matchStage: string, dto: UpdateStageDto) {

		const current = await this.model.findOne({ matchStage }).exec()
		if (!current) {
			throw new NotFoundException(`Stage ${matchStage} not found`)
		}

		if (dto.status !== current.status + 1) {
			throw new BadRequestException(`Invalid transition: ${StageStatus[current.status]} → ${StageStatus[dto.status]}`)
		}

		const updated = await this.model.findOneAndUpdate({ matchStage }, dto, { new: true }).exec()

		if (dto.status === StageStatus.OPEN) {
			await this.betService.seedBetsForMatch(matchStage)
		}

		return updated
	}
}
