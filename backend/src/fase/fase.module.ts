import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import { Fase, FaseSchema } from './schemas/fase.schema'
import { FaseController } from './fase.controller'
import { FaseService } from './fase.service'

@Module({
	imports: [MongooseModule.forFeature([{ name: Fase.name, schema: FaseSchema }])],
	controllers: [FaseController],
	providers: [FaseService],
	exports: [FaseService],
})
export class FaseModule {}
