import { STAGE_DEADLINES, STAGE_ORDER, type StageVisibleItem } from '@bolao/shared'
import { BadRequestException, Injectable, Logger, NotFoundException, OnModuleInit } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'

import { Match, MatchStage } from '../match/schemas/match.schema'
import { UserService } from '../user/user.service'
import { UpdateStageDto } from './dto/update-stage.dto'
import { Stage, StageStatus } from './schemas/stage.schema'

@Injectable()
export class StageService implements OnModuleInit {

	private readonly logger = new Logger(StageService.name)

	constructor(
		@InjectModel(Stage.name) private readonly model: Model<Stage>,
		@InjectModel(Match.name) private readonly matchModel: Model<Match>,
		private readonly userService: UserService,
	) { }

	async onModuleInit() {

		const count = await this.model.estimatedDocumentCount().exec()
		if (count > 0) {
			return
		}

		await this.model.insertMany(Object.entries(STAGE_ORDER).map(([matchStage, order]) => ({
			matchStage: matchStage as MatchStage,
			order,
			status: (matchStage as MatchStage) === MatchStage.GROUP_STAGE ? StageStatus.OPEN : StageStatus.DISABLED,
			deadline: new Date(STAGE_DEADLINES[matchStage as MatchStage]),
		})))

		this.logger.log(`Initialized stage collection with ${Object.entries(STAGE_ORDER).length} stages`)
	}

	findAll() {
		return this.model.find().sort({ order: 1 }).exec()
	}

	async findVisibleStages(): Promise<StageVisibleItem[]> {
		const stages = await this.model
			.find({ status: { $in: [StageStatus.OPEN, StageStatus.BLOCKED] } })
			.sort({ order: 1 })
			.exec()
		return stages.map((s) => ({
			matchStage: s.matchStage,
			order: s.order,
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

		if (dto.status === StageStatus.OPEN) {
			const invalidCount = await this.matchModel.countDocuments({ stage: matchStage, valid: false }).exec()
			if (invalidCount > 0) {
				throw new BadRequestException(
					`Não é possível abrir a fase ${matchStage}: ${invalidCount} partida(s) sem times definidos.`,
				)
			}
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

		const users = await this.userService.findActiveUsers()

		if (users.length === 0) {
			this.logger.log(`Skipping seed for stage ${matchStage}: no active users`)
			return
		}

		for (const user of users) {
			await this.userService.seedBetsForUser(user._id.toString())
		}
		this.logger.log(`Seed stage ${matchStage}: processed ${users.length} active user(s)`)
	}

	async blockExpiredStages(now: Date = new Date()) {

		const expired = await this.model
			.find({ status: StageStatus.OPEN, deadline: { $ne: null, $lte: now } })
			.exec()

		if (expired.length === 0) return

		const result = await this.model
			.updateMany(
				{ _id: { $in: expired.map((s) => s._id) }, status: StageStatus.OPEN },
				{ $set: { status: StageStatus.BLOCKED } },
			)
			.exec()

		if (result.modifiedCount > 0) {
			const names = expired.map((s) => s.matchStage).join(', ')
			this.logger.log(`Auto-blocked ${result.modifiedCount} stage(s) past deadline: ${names}`)
		}
	}

}
