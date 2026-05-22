import { Injectable, OnModuleInit } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'

import { Config } from './schemas/config.schema'

@Injectable()
export class AppConfigService implements OnModuleInit {

	constructor(@InjectModel(Config.name) private readonly model: Model<Config>) { }

	async onModuleInit() {
		const exists = await this.model.exists({})
		if (!exists) {
			await this.model.create({ })
		}
	}

	findOne() {
		return this.model.findOne().exec()
	}

	setUpdatingScores(updatingScores: boolean) {
		return this.model.updateOne({}, { updatingScores }, { upsert: true }).exec()
	}
}
