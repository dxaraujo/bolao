import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'

import { Config } from './schemas/config.schema'

@Injectable()
export class AppConfigService {
	constructor(@InjectModel(Config.name) private readonly model: Model<Config>) {}

	findAll() {
		return this.model.find({}).exec()
	}

	setAtualizandoPontuacoes(atualizando: boolean) {
		return this.model.updateMany({}, { atualizandoPontuacoes: atualizando }).exec()
	}
}
