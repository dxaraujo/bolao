import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import { AppConfigModule } from '../config/config.module'
import { Palpite, PalpiteSchema } from '../palpite/schemas/palpite.schema'
import { User, UserSchema } from '../user/schemas/user.schema'
import { PartidaController } from './partida.controller'
import { PartidaService } from './partida.service'
import { ResultadoService } from './resultado.service'
import { Partida, PartidaSchema } from './schemas/partida.schema'

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: Partida.name, schema: PartidaSchema },
			{ name: Palpite.name, schema: PalpiteSchema },
			{ name: User.name, schema: UserSchema },
		]),
		AppConfigModule,
	],
	controllers: [PartidaController],
	providers: [PartidaService, ResultadoService],
	exports: [PartidaService, ResultadoService],
})
export class PartidaModule {}
