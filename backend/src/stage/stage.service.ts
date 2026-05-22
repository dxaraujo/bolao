import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import type { StageVisibleItem } from '@bolao/shared'

import { Bet } from '../bet/schemas/bet.schema'
import { Match, MatchStage } from '../match/schemas/match.schema'
import { User } from '../user/schemas/user.schema'
import { UpdateStageDto } from './dto/update-stage.dto'
import { Stage, StageStatus } from './schemas/stage.schema'

@Injectable()
export class StageService {

	private readonly logger = new Logger(StageService.name)

	constructor(
		@InjectModel(Stage.name) private readonly model: Model<Stage>,
		@InjectModel(Match.name) private readonly matchModel: Model<Match>,
		@InjectModel(Bet.name) private readonly betModel: Model<Bet>,
		@InjectModel(User.name) private readonly userModel: Model<User>,
	) { }

	findAll() {
		return this.model.find().exec()
	}

	async findVisibleStages(): Promise<StageVisibleItem[]> {
		const stages = await this.model
			.find({ status: { $in: [StageStatus.OPEN, StageStatus.BLOCKED] } })
			.exec()
		return stages.map((s) => ({
			matchStage: s.matchStage,
			status: s.status,
			deadline: s.deadline ? s.deadline.toISOString() : undefined,
		}))
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

	async existsByMatchStage(matchStage: MatchStage) {
		return await this.model.exists({ matchStage }).exec();
	}

	async create(matchStage: MatchStage) {
		return await this.model.create({ matchStage, status: StageStatus.DISABLED });
	}

	async update(matchStage: string, dto: UpdateStageDto) {

		const current = await this.model.findOne({ matchStage }).exec()
		if (!current) {
			throw new NotFoundException(`Stage ${matchStage} not found`)
		}

		const order: StageStatus[] = [StageStatus.DISABLED, StageStatus.OPEN, StageStatus.BLOCKED]
		const expectedNext = order[order.indexOf(current.status) + 1]
		if (!expectedNext || dto.status !== expectedNext) {
			throw new BadRequestException(`Invalid transition: ${current.status} → ${dto.status}`)
		}

		const updated = await this.model.findOneAndUpdate({ matchStage }, dto, { new: true }).exec()

		this.logger.log(`Stage ${matchStage} updated to ${StageStatus[dto.status]}`)

		if (dto.status === StageStatus.OPEN) {
			this.logger.log(`Seeding bets for stage ${matchStage}`)
			await this.seedBetsForStage(matchStage)
			this.logger.log(`Bets seeded for stage ${matchStage}`)
		}

		return updated
	}

	async seedBetsForStage(matchStage: string) {

		const [matches, users] = await Promise.all([
			this.matchModel.find({ stage: matchStage }, { _id: 1 }).exec(),
			this.userModel.find({ isActive: true }, { _id: 1 }).exec(),
		])

		if (matches.length === 0 || users.length === 0) {
			this.logger.log(`Skipping seed for ${matchStage}: ${matches.length} match(es), ${users.length} active user(s)`)
			return
		}

		const result = await this.betModel.bulkWrite(
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
		this.logger.log(`Seed ${matchStage}: ${result.upsertedCount} new bet(s) for ${users.length} user(s) × ${matches.length} match(es)`)
	}
}
