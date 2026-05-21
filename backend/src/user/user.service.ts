import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'

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

	constructor(@InjectModel(User.name) private readonly userModel: Model<User>) { }

	findById(id: string) {
		return this.userModel.findById(id).exec()
	}

	findAll() {
		return this.userModel.find().exec()
	}

	findActiveUsers() {
		return this.userModel.find({ isActive: true }).exec()
	}

	upsert(input: CreateUserInput) {
		return this.userModel.findOneAndUpdate({ googleSub: input.googleSub }, input, { new: true, upsert: true }).exec()
	}

	async update(id: string, input: UpdateUserDto) {
		const user = await this.userModel.findByIdAndUpdate(id, input, { new: true }).exec()
		if (!user) {
			throw new NotFoundException(`User ${id} not found`)
		}
		return user
	}
}
