import { StageStatus } from '@bolao/shared'
import { Injectable, Logger, NotFoundException, OnModuleInit } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { InjectModel } from '@nestjs/mongoose'
import { Model, Types } from 'mongoose'
import * as path from 'node:path'

import { Bet } from '../bet/schemas/bet.schema'
import { downloadImage } from '../common/download'
import { isLocalStaticFileOnDisk, resolveStaticDir } from '../common/static-dir'
import { Match } from '../match/schemas/match.schema'
import { Stage } from '../stage/schemas/stage.schema'
import { UpdateUserDto } from './dto/update-user.dto'
import { User, UserDocument } from './schemas/user.schema'
import { GoogleProfile } from 'src/auth/auth.service'

@Injectable()
export class UserService implements OnModuleInit {

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

	async onModuleInit() {
		await this.syncMissingPictures()
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

	async upsert(input: GoogleProfile) {

		// `picture` é zerado apenas na criação. `externalPicture` é sempre sobrescrito
		// com a URL mais recente vinda do Google.
		const user = await this.userModel.findOneAndUpdate(
			{ googleSub: input.googleSub },
			{
				$set: { googleSub: input.googleSub, name: input.name, email: input.email, externalPicture: input.externalPicture },
				$setOnInsert: { picture: '' },
			},
			{ new: true, upsert: true },
		).exec()

		// URL externa ausente ou inválida: mantém `picture` como está.
		if (!input.externalPicture || !/^https?:\/\//i.test(input.externalPicture)) {
			return user
		}

		const picture = await this.downloadPicture(user.id, input.externalPicture)

		// Download falhou: preserva o invariante de `picture` (vazio ou `/static/...`).
		if (!picture) return user

		return await this.userModel.findOneAndUpdate({ googleSub: input.googleSub }, { $set: { picture } }, { new: true }).exec()
	}

	private async downloadPicture(userId: string, url: string): Promise<string | null> {
		const result = await downloadImage(url, path.join(this.staticDir, 'users'), userId, '/static/users')
		if (!result) {
			this.logger.warn(`Falling back to external picture URL for user ${userId}`)
			return null
		}
		return result.relativePath
	}

	private async syncMissingPictures() {
		const users = await this.userModel.find({
			picture: { $regex: /^\/static\// },
			externalPicture: { $regex: /^https?:\/\//i },
		}).exec()

		const missing: UserDocument[] = []
		for (const user of users) {
			if (!(await isLocalStaticFileOnDisk(this.staticDir, user.picture))) {
				missing.push(user)
			}
		}

		if (missing.length === 0) return

		this.logger.warn(`Restoring ${missing.length} missing user picture(s) on disk`)

		for (const user of missing) {
			const userId = (user._id as Types.ObjectId).toString()
			const localPicture = await this.downloadPicture(userId, user.externalPicture)
			if (localPicture && localPicture !== user.picture) {
				await this.userModel.updateOne({ _id: user._id }, { $set: { picture: localPicture } }).exec()
			}
		}
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
