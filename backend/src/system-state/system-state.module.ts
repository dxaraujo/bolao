import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import { SystemState, SystemStateSchema } from './schemas/system-state.schema'
import { SystemStateController } from './system-state.controller'
import { SystemStateService } from './system-state.service'

@Module({
	imports: [MongooseModule.forFeature([{ name: SystemState.name, schema: SystemStateSchema }])],
	controllers: [SystemStateController],
	providers: [SystemStateService],
	exports: [SystemStateService],
})
export class SystemStateModule {}
