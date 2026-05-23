import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { InjectModel } from '@nestjs/mongoose'
import { Model, Types } from 'mongoose'
import * as path from 'node:path'

import { downloadImage } from '../common/download'
import { StageService } from '../stage/stage.service'
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
		private readonly stageService: StageService,
		config: ConfigService,
	) {
		this.staticDir = path.resolve(process.cwd(), config.get<string>('STATIC_DIR') ?? 'static')
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
			throw new NotFoundException(`User ${userId} not valid`)
		}

		const user = await this.findById(userId)
		if (!user) {
			throw new NotFoundException(`User ${userId} not found`)
		}

		const willActivate = input.isActive === true && user.isActive === false

		const result = await this.userModel.updateOne({ _id: user._id }, input, { new: true }).exec()

		if (willActivate) {
			this.logger.log(`User ${user._id} activated; seeding bets`)
			await this.stageService.seedBetsForUser((user._id as Types.ObjectId).toString())
		}

		return result
	}
}
