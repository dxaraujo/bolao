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
			await this.model.create({ lastUpdateResults: new Date() })
		}
	}

	findOne() {
		return this.model.findOne().exec()
	}

	setLastUpdateResults(lastUpdateResults: Date) {
		return this.model.updateOne({}, { lastUpdateResults }, { upsert: true }).exec()
	}
}
