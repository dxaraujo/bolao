import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'

import { CreateTeamDto } from './dto/create-team.dto'
import { UpdateTeamDto } from './dto/update-team.dto'
import { Team } from './schemas/team.schema'

@Injectable()
export class TeamService {
	constructor(@InjectModel(Team.name) private readonly model: Model<Team>) { }

	findAll(query: Record<string, unknown>) {
		return this.model.find(query).exec()
	}

	findById(id: string) {
		return this.model.findById(id).exec()
	}

	findByFootballDataTeamId(id: number) {
		return this.model.findOne({ id }).exec()
	}

	create(dto: CreateTeamDto) {
		return this.model.create(dto)
	}

	async update(id: string, dto: UpdateTeamDto) {
		const updated = await this.model.findByIdAndUpdate(id, dto, { new: true }).exec()
		if (!updated) throw new NotFoundException(`Team ${id} não encontrado`)
		return updated
	}

	async remove(id: string) {
		const removed = await this.model.findByIdAndDelete(id).exec()
		if (!removed) throw new NotFoundException(`Team ${id} não encontrado`)
		return removed
	}
}
