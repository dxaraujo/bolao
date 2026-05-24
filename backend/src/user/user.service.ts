import { Injectable, Logger, NotFoundException, OnModuleInit } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model, Types } from 'mongoose'

import { GoogleProfile } from '../auth/auth.service'
import { LeaderboardService } from '../leaderboard/leaderboard.service'
import { MediaService } from '../media/media.service'
import { UpdateUserDto } from './dto/update-user.dto'
import { User, UserDocument } from './schemas/user.schema'

@Injectable()
export class UserService implements OnModuleInit {
	private readonly logger = new Logger(UserService.name)

	constructor(
		@InjectModel(User.name) private readonly userModel: Model<User>,
		private readonly media: MediaService,
		private readonly leaderboardService: LeaderboardService,
	) {}

	async onModuleInit() {
		await this.syncMissingAvatars()
	}

	findById(id: string) {
		return this.userModel.findById(id).exec()
	}

	findActiveUsers() {
		return this.userModel.find({ isActive: true }).sort({ name: 1 }).exec()
	}

	findAll() {
		return this.userModel.find().sort({ name: 1 }).exec()
	}

	async upsertFromGoogle(profile: GoogleProfile): Promise<UserDocument> {
		// Atualiza ou cria o usuário com os dados do Google.
		const user = await this.userModel
			.findOneAndUpdate(
				{ googleSub: profile.googleSub },
				{ $set: { googleSub: profile.googleSub, name: profile.name, email: profile.email, picture: profile.picture } },
				{ new: true, upsert: true },
			)
			.exec()

		// Se o usuário não foi criado ou atualizado, lança um erro.
		if (!user) {
			throw new NotFoundException(`Falha ao criar/atualizar usuário ${profile.googleSub}`)
		}

		// Se o avatar do usuário é uma URL externa, baixa o avatar para o disco.
		if (this.isValidPicture(profile.picture)) {
			const local = await this.media.downloadUserAvatar(user.id, profile.picture)
			if (local) {
				return await this.userModel.findOneAndUpdate({ googleSub: profile.googleSub }, { $set: { avatar: local } }, { new: true, upsert: true }).exec()
			}
		}

		return user
	}

	async update(userId: string, input: UpdateUserDto): Promise<UserDocument> {
		if (!Types.ObjectId.isValid(userId)) {
			throw new NotFoundException(`Usuário ${userId} inválido`)
		}

		const user = await this.userModel.findById(userId).exec()
		if (!user) {
			throw new NotFoundException(`Usuário ${userId} não encontrado`)
		}

		const willChangeActive = typeof input.isActive === 'boolean' && input.isActive !== user.isActive

		const $set: Record<string, unknown> = {}

		if (typeof input.isAdmin === 'boolean') {
			$set.isAdmin = input.isAdmin
		}

		if (typeof input.isActive === 'boolean') {
			$set.isActive = input.isActive
			if (willChangeActive) {
				$set.participationChangedAt = new Date()
			}
		}

		const updated = await this.userModel.findByIdAndUpdate(user._id, { $set }, { new: true }).exec()
		if (!updated) {
			throw new NotFoundException(`Usuário ${userId} não encontrado`)
		}

		if (willChangeActive) {
			this.logger.log(`User ${userId} isActive=${input.isActive} (participationChangedAt updated)`)
			await this.leaderboardService.rebuild()
		}

		return updated
	}

	private isValidPicture(picture: string): boolean {
		return !!picture && /^https?:\/\//i.test(picture)
	}

	// private async syncMissingAvatars() {
	// 	const users = await this.userModel.find({ avatar: { $regex: /^\/static\// } }).exec()
	// 	const missing: UserDocument[] = []
	// 	for (const u of users) {
	// 		if (!(await this.media.isLocalAvailable(u.avatar))) missing.push(u)
	// 	}
	// 	if (missing.length === 0) return
	// 	this.logger.warn(`Avatars missing on disk for ${missing.length} user(s); will be re-downloaded on next login.`)
	// }

	private async syncMissingAvatars() {
		// Consulta todos os usuários
		const users = await this.userModel.find({}).exec()

		// Encontra os usuários que não têm a foto localizada
		const missing: UserDocument[] = []
		for (const user of users) {
			if (!(await this.media.isLocalAvailable(user.avatar))) {
				missing.push(user)
			}
		}

		// Todas as fotos estão atualizadas no disco
		if (missing.length === 0) {
			return
		}

		this.logger.warn(`Restoring ${missing.length} missing user picture(s) on disk`)

		// Baixa as fotos que estão faltando no disco
		for (const user of missing) {
			const localPicture = await this.media.downloadUserAvatar(user.id, user.picture)
			if (localPicture) {
				await this.userModel.updateOne({ googleSub: user.googleSub }, { $set: { avatar: localPicture } }).exec()
			}
		}
	}
}
