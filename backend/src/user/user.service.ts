import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model, Types } from 'mongoose'

import { Phase, PhaseStatus } from '../phase/schemas/phase.schema'
import { Bet } from '../bet/schemas/bet.schema'
import { User } from './schemas/user.schema'

export interface CreateUserInput {
	googleSub: string
	name: string
	email: string
	picture?: string
}

export interface UpdateUserInput {
	isAdmin?: boolean
	ativo?: boolean
}

@Injectable()
export class UserService {
	constructor(
		@InjectModel(User.name) private readonly userModel: Model<User>,
		@InjectModel(Phase.name) private readonly phaseModel: Model<Phase>,
		@InjectModel(Bet.name) private readonly betModel: Model<Bet>,
	) {}

	findById(id: string) {
		return this.userModel.findById(id).exec()
	}

	upsert(input: CreateUserInput) {
		return this.userModel
			.findOneAndUpdate({ googleSub: input.googleSub }, input, { new: true, upsert: true })
			.exec()
	}

	async findAllWithBets(query: Record<string, unknown>) {
		const users = await this.userModel.find(query).exec()
		const phasesBloqueadas = await this.phaseModel.find({ status: PhaseStatus.BLOCKED }).exec()
		const nomesPermitidos = new Set(phasesBloqueadas.map((f) => f.name))

		for (const user of users) {
			if (!user.ativo) continue
			const bets = await this.betModel
				.find({ user: user._id })
				.sort({ 'partida.order': 'asc' })
				.exec()
			user.set(
				'bets',
				bets.filter((p) => nomesPermitidos.has(p.match.stage)),
			)
		}
		return users
	}

	async update(id: string, input: UpdateUserInput) {
		const user = await this.userModel
			.findByIdAndUpdate(id, input, { new: true })
			.exec()
		if (!user) throw new NotFoundException(`Usuário ${id} não encontrado`)
		return user
	}

	async remove(id: string) {
		const user = await this.userModel.findById(id).exec()
		if (!user) return null
		await this.betModel.deleteMany({ user: user._id as Types.ObjectId }).exec()
		return this.userModel.findByIdAndDelete(user._id as Types.ObjectId).exec()
	}
}
