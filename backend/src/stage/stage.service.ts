import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'

import { Bet } from '../bet/schemas/bet.schema'
import { Match } from '../match/schemas/match.schema'
import { User } from '../user/schemas/user.schema'
import { UpdateStageDto } from './dto/update-stage.dto'
import { Stage, StageStatus } from './schemas/stage.schema'

@Injectable()
export class StageService {

	constructor(
		@InjectModel(Stage.name) private readonly model: Model<Stage>,
		@InjectModel(Match.name) private readonly matchModel: Model<Match>,
		@InjectModel(Bet.name) private readonly betModel: Model<Bet>,
		@InjectModel(User.name) private readonly userModel: Model<User>,
	) { }

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

	async isStageBlocked(matchStage: string): Promise<boolean> {
		const stage = await this.model.findOne({ matchStage, status: StageStatus.BLOCKED }).exec()
		return stage != null
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
			await this.seedBetsForStage(matchStage)
		}

		return updated
	}

	private async seedBetsForStage(matchStage: string) {

		const [matches, users] = await Promise.all([
			this.matchModel.find({ stage: matchStage }, { _id: 1 }).exec(),
			this.userModel.find({ isActive: true }, { _id: 1 }).exec(),
		])

		if (matches.length === 0 || users.length === 0) return

		await this.betModel.bulkWrite(
			matches.flatMap((match) =>
				users.map((user) => ({
					updateOne: {
						filter: { user: user._id, match: match._id },
						update: { $setOnInsert: { user: user._id, match: match._id } },
						upsert: true,
					},
				})),
			),
		)
	}
}
