import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'

import { Config } from './schemas/config.schema'

@Injectable()
export class AppConfigService {

	constructor(@InjectModel(Config.name) private readonly model: Model<Config>) { }

	findOne() {
		return this.model.find({}).findOne().exec()
	}

	setUpdatingScores(updatingScores: boolean) {
		return this.model.updateOne({}, { updatingScores }).exec()
	}
}
