import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model, Types } from 'mongoose'

import { Fase, FaseStatus } from '../fase/schemas/fase.schema'
import { Palpite } from '../palpite/schemas/palpite.schema'
import { User } from './schemas/user.schema'

export interface CreateUserInput {
	name: string
	email: string
	picture: string
}

export interface UpdateUserInput {
	isAdmin?: boolean
	ativo?: boolean
}

@Injectable()
export class UserService {
	constructor(
		@InjectModel(User.name) private readonly userModel: Model<User>,
		@InjectModel(Fase.name) private readonly faseModel: Model<Fase>,
		@InjectModel(Palpite.name) private readonly palpiteModel: Model<Palpite>,
	) {}

	findById(id: string) {
		return this.userModel.findById(id).exec()
	}

	findByEmail(email: string) {
		return this.userModel.findOne({ email }).exec()
	}

	create(input: CreateUserInput) {
		return this.userModel.create(input)
	}

	async findAllWithPalpites(query: Record<string, unknown>) {
		const users = await this.userModel.find(query).exec()
		const fasesBloqueadas = await this.faseModel.find({ status: FaseStatus.BLOQUEADO }).exec()
		const nomesPermitidos = new Set(fasesBloqueadas.map((f) => f.nome))

		for (const user of users) {
			if (!user.ativo) continue
			const palpites = await this.palpiteModel
				.find({ user: user._id })
				.sort({ 'partida.order': 'asc' })
				.exec()
			user.set(
				'palpites',
				palpites.filter((p) => nomesPermitidos.has(p.partida.fase)),
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
		await this.palpiteModel.deleteMany({ user: user._id as Types.ObjectId }).exec()
		return this.userModel.findByIdAndDelete(user._id as Types.ObjectId).exec()
	}
}
