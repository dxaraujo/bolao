import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { LoggerModule as PinoLoggerModule } from 'nestjs-pino'

@Module({
	imports: [
		PinoLoggerModule.forRootAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: (config: ConfigService) => {
				const nodeEnv = config.get<string>('NODE_ENV', 'development')
				const isProd = nodeEnv === 'production'
				return {
					pinoHttp: {
						level: isProd ? 'info' : 'debug',
						transport: isProd
							? undefined
							: {
									target: 'pino-pretty',
									options: { singleLine: true, translateTime: 'SYS:HH:MM:ss.l' },
								},
						redact: {
							paths: ['req.headers.authorization', 'req.headers.cookie', '*.token', '*.password'],
							remove: true,
						},
						customLogLevel: (_req, res, err) => {
							if (err || res.statusCode >= 500) return 'error'
							if (res.statusCode >= 400) return 'warn'
							return 'info'
						},
					},
				}
			},
		}),
	],
	exports: [PinoLoggerModule],
})
export class LoggerModule {}
