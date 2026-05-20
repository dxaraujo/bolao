import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import { Fase, FaseSchema } from '../fase/schemas/fase.schema'
import { Partida, PartidaSchema } from '../partida/schemas/partida.schema'
import { PalpiteController } from './palpite.controller'
import { PalpiteService } from './palpite.service'
import { Palpite, PalpiteSchema } from './schemas/palpite.schema'

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: Palpite.name, schema: PalpiteSchema },
			{ name: Fase.name, schema: FaseSchema },
			{ name: Partida.name, schema: PartidaSchema },
		]),
	],
	controllers: [PalpiteController],
	providers: [PalpiteService],
	exports: [PalpiteService],
})
export class PalpiteModule {}
