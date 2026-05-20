import { randomUUID } from 'node:crypto'
import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { LoggerModule as PinoLoggerModule } from 'nestjs-pino'
import type { IncomingMessage, ServerResponse } from 'node:http'

const REQUEST_ID_HEADER = 'x-request-id'

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
						genReqId: (req: IncomingMessage, res: ServerResponse) => {
							const incoming = req.headers[REQUEST_ID_HEADER]
							const id = typeof incoming === 'string' && incoming.length > 0 ? incoming : randomUUID()
							res.setHeader(REQUEST_ID_HEADER, id)
							return id
						},
						customProps: (req: IncomingMessage) => ({
							reqId: (req as IncomingMessage & { id?: string }).id,
						}),
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
export class LoggerModule { }
