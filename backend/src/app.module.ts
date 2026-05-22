import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { APP_GUARD } from '@nestjs/core'
import { MongooseModule } from '@nestjs/mongoose'

import { AuthModule } from './auth/auth.module'
import { JwtAuthGuard } from './auth/jwt-auth.guard'
import { BetModule } from './bet/bet.module'
import { AppConfigModule } from './config/config.module'
import { HealthModule } from './health/health.module'
import { MatchModule } from './match/match.module'
import { RankingModule } from './ranking/ranking.module'
import { ScheduleModule } from './schedule/schedule.module'
import { StageModule } from './stage/stage.module'
import { StatsModule } from './stats/stats.module'
import { TeamModule } from './team/team.module'
import { UserModule } from './user/user.module'

@Module({
	imports: [
		ConfigModule.forRoot({ isGlobal: true, cache: true }),
		MongooseModule.forRootAsync({
			inject: [ConfigService],
			useFactory: (config: ConfigService) => ({
				uri: config.getOrThrow<string>('MONGODB_URI'),
				serverSelectionTimeoutMS: 5000,
				connectTimeoutMS: 5000,
			}),
		}),
		AuthModule,
		UserModule,
		TeamModule,
		StageModule,
		RankingModule,
		StatsModule,
		AppConfigModule,
		MatchModule,
		BetModule,
		ScheduleModule,
		HealthModule,
	],
	providers: [{ provide: APP_GUARD, useClass: JwtAuthGuard }],
})
export class AppModule { }
