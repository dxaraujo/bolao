import { StageStatus } from '@bolao/shared'
import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { InjectModel } from '@nestjs/mongoose'
import { Model, Types } from 'mongoose'
import * as path from 'node:path'

import { Bet } from '../bet/schemas/bet.schema'
import { downloadImage } from '../common/download'
import { resolveStaticDir } from '../common/static-dir'
import { Match } from '../match/schemas/match.schema'
import { Stage } from '../stage/schemas/stage.schema'
import { UpdateUserDto } from './dto/update-user.dto'
import { User } from './schemas/user.schema'

export interface CreateUserInput {
	googleSub: string
	name: string
	email: string
	picture?: string
}

@Injectable()
export class UserService {

	private readonly logger = new Logger(UserService.name)
	private readonly staticDir: string

	constructor(
		@InjectModel(User.name) private readonly userModel: Model<User>,
		@InjectModel(Bet.name) private readonly betModel: Model<Bet>,
		@InjectModel(Stage.name) private readonly stageModel: Model<Stage>,
		@InjectModel(Match.name) private readonly matchModel: Model<Match>,
		config: ConfigService,
	) {
		this.staticDir = resolveStaticDir(config.get<string>('STATIC_DIR'))
	}

	findById(id: string) {
		return this.userModel.findById(id).exec()
	}

	findActiveUsers() {
		return this.userModel.find({ isActive: true }).exec()
	}

	findAll() {
		return this.userModel.find().exec()
	}

	async upsert(input: CreateUserInput) {

		const existing = await this.userModel.findOne({ googleSub: input.googleSub }).exec()
		const externalPicture = input.picture

		// Primeiro upsert grava a URL externa para garantir _id; depois (se a URL mudou) baixamos
		// localmente e sobrescrevemos o campo picture.
		const user = await this.userModel.findOneAndUpdate({ googleSub: input.googleSub }, input, { new: true, upsert: true }).exec()

		if (!externalPicture || !/^https?:\/\//i.test(externalPicture)) return user

		const previousWasLocal = existing?.picture?.startsWith('/static/') ?? false
		const externalChanged = !existing || existing.picture !== externalPicture

		if (previousWasLocal && !externalChanged) return user

		const localPicture = await this.downloadPicture((user._id as Types.ObjectId).toString(), externalPicture)
		if (!localPicture || localPicture === user.picture) return user

		user.picture = localPicture
		await this.userModel.updateOne({ _id: user._id }, { $set: { picture: localPicture } }).exec()
		return user
	}

	private async downloadPicture(userId: string, url: string): Promise<string | null> {
		const result = await downloadImage(url, path.join(this.staticDir, 'users'), userId, '/static/users')
		if (!result) {
			this.logger.warn(`Falling back to external picture URL for user ${userId}`)
			return null
		}
		return result.relativePath
	}

	async update(userId: string, input: UpdateUserDto) {

		if (!Types.ObjectId.isValid(userId)) {
			throw new NotFoundException(`Usuário ${userId} inválido`)
		}

		const user = await this.findById(userId)
		if (!user) {
			throw new NotFoundException(`Usuário ${userId} não encontrado`)
		}

		const willActivate = input.isActive === true && user.isActive === false
		const willDeactivate = input.isActive === false && user.isActive === true

		const result = await this.userModel.updateOne({ _id: user._id }, input, { new: true }).exec()

		const userIdStr = user._id.toString()

		if (willActivate) {
			this.logger.log(`User ${userIdStr} activated; seeding bets`)
			await this.seedBetsForUser(userIdStr)
		} else if (willDeactivate) {
			this.logger.log(`User ${userIdStr} deactivated; removing bets`)
			await this.removeBetsForUser(userIdStr)
		}

		return result
	}

	async seedBetsForUser(userId: string) {

		const stages = await this.findStageNamesByStatus([StageStatus.OPEN, StageStatus.BLOCKED])

		if (stages.length === 0) {
			this.logger.log(`Skipping seed for user ${userId}: no OPEN/BLOCKED stages`)
			return
		}

		const matchIds = await this.findMatchIdsByStages(stages)

		if (matchIds.length === 0) {
			this.logger.log(`Skipping seed for user ${userId}: no valid matches in OPEN/BLOCKED stages`)
			return
		}

		const result = await this.betModel.bulkWrite(
			matchIds.map((matchId) => ({
				updateOne: {
					filter: { user: userId, match: matchId },
					update: { $setOnInsert: { user: userId, match: matchId } },
					upsert: true,
				},
			})),
		)
		this.logger.log(`Seed user ${userId}: ${result.upsertedCount} new bet(s) across ${matchIds.length} match(es)`)
	}

	async removeBetsForUser(userId: string) {
		const result = await this.betModel.deleteMany({ user: userId }).exec()
		this.logger.log(`Removed ${result.deletedCount} bet(s) for user ${userId}`)
	}

	private async findStageNamesByStatus(statuses: StageStatus[]): Promise<string[]> {
		const stages = await this.stageModel.find({ status: { $in: statuses } }, { matchStage: 1 }).exec()
		return stages.map((s) => s.matchStage)
	}

	private findMatchIdsByStages(stageNames: string[]) {
		return this.matchModel.find({ stage: { $in: stageNames }, valid: true }).distinct('_id').exec()
	}
}
