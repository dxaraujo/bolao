import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import { Time, TimeSchema } from './schemas/time.schema'
import { TimeController } from './time.controller'
import { TimeService } from './time.service'

@Module({
	imports: [MongooseModule.forFeature([{ name: Time.name, schema: TimeSchema }])],
	controllers: [TimeController],
	providers: [TimeService],
	exports: [TimeService],
})
export class TimeModule {}
