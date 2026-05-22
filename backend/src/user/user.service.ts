import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model, Types } from 'mongoose'

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

	findActiveUsers() {
		return this.userModel.find({ isActive: true }).exec()
	}

	findAll() {
		return this.userModel.find().exec()
	}

	upsert(input: CreateUserInput) {
		return this.userModel.findOneAndUpdate({ googleSub: input.googleSub }, input, { new: true, upsert: true }).exec()
	}

	async update(userId: string, input: UpdateUserDto) {

		if (!Types.ObjectId.isValid(userId)) {
			throw new NotFoundException(`User ${userId} not valid`)
		}

		const user = await this.findById(userId)
		if (!user) {
			throw new NotFoundException(`User ${userId} not found`)
		}

		return await this.userModel.updateOne({ _id: user._id }, input, { new: true }).exec()
	}
}
