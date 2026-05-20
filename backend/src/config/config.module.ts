import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import { AppConfigController } from './config.controller'
import { AppConfigService } from './config.service'
import { Config, ConfigSchema } from './schemas/config.schema'

@Module({
	imports: [MongooseModule.forFeature([{ name: Config.name, schema: ConfigSchema }])],
	controllers: [AppConfigController],
	providers: [AppConfigService],
	exports: [AppConfigService],
})
export class AppConfigModule {}
