import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import { Phase, PhaseSchema } from './schemas/phase.schema'
import { PhaseController } from './phase.controller'
import { PhaseService } from './phase.service'

@Module({
	imports: [MongooseModule.forFeature([{ name: Phase.name, schema: PhaseSchema }])],
	controllers: [PhaseController],
	providers: [PhaseService],
	exports: [PhaseService],
})
export class PhaseModule {}
