import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { MongooseModule } from '@nestjs/mongoose'
import { APP_GUARD } from '@nestjs/core'
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler'

import { validateEnv } from './common/env.validation'
import { LoggerModule } from './common/logger.module'
import { JwtAuthGuard } from './auth/jwt-auth.guard'
import { AuthModule } from './auth/auth.module'
import { AppConfigModule } from './config/config.module'
import { PhaseModule } from './phase/phase.module'
import { HealthModule } from './health/health.module'
import { BetModule } from './bet/bet.module'
import { MatchModule } from './match/match.module'
import { ScheduleModule } from './schedule/schedule.module'
import { TeamModule } from './team/team.module'
import { UserModule } from './user/user.module'

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
			cache: true,
			validate: validateEnv,
		}),
		LoggerModule,
		ThrottlerModule.forRootAsync({
			inject: [ConfigService],
			useFactory: (config: ConfigService) => ({
				throttlers: [
					{
						ttl: config.getOrThrow<number>('THROTTLE_TTL_SECONDS') * 1000,
						limit: config.getOrThrow<number>('THROTTLE_LIMIT'),
					},
				],
			}),
		}),
		MongooseModule.forRootAsync({
			inject: [ConfigService],
			useFactory: (config: ConfigService) => ({
				uri: config.getOrThrow<string>('MONGODB_URI'),
			}),
		}),
		AuthModule,
		UserModule,
		TeamModule,
		PhaseModule,
		AppConfigModule,
		MatchModule,
		BetModule,
		ScheduleModule,
		HealthModule,
	],
	providers: [
		{ provide: APP_GUARD, useClass: ThrottlerGuard },
		{ provide: APP_GUARD, useClass: JwtAuthGuard },
	],
})
export class AppModule {}
