import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { MongooseModule } from '@nestjs/mongoose'
import { APP_GUARD } from '@nestjs/core'

import { validateEnv } from './common/env.validation'
import { LoggerModule } from './common/logger.module'
import { JwtAuthGuard } from './auth/jwt-auth.guard'
import { AuthModule } from './auth/auth.module'
import { AppConfigModule } from './config/config.module'
import { FaseModule } from './fase/fase.module'
import { HealthModule } from './health/health.module'
import { PalpiteModule } from './palpite/palpite.module'
import { PartidaModule } from './partida/partida.module'
import { ScheduleModule } from './schedule/schedule.module'
import { TimeModule } from './time/time.module'
import { UserModule } from './user/user.module'

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
			cache: true,
			validate: validateEnv,
		}),
		LoggerModule,
		MongooseModule.forRootAsync({
			inject: [ConfigService],
			useFactory: (config: ConfigService) => ({
				uri: config.getOrThrow<string>('MONGODB_URI'),
			}),
		}),
		AuthModule,
		UserModule,
		TimeModule,
		FaseModule,
		AppConfigModule,
		PartidaModule,
		PalpiteModule,
		ScheduleModule,
		HealthModule,
	],
	providers: [
		{
			provide: APP_GUARD,
			useClass: JwtAuthGuard,
		},
	],
})
export class AppModule {}
