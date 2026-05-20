import { NestFactory } from '@nestjs/core'
import { ConfigService } from '@nestjs/config'
import { ValidationPipe } from '@nestjs/common'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { Logger } from 'nestjs-pino'
import helmet from 'helmet'

import { AppModule } from './app.module'
import { AllExceptionsFilter } from './common/all-exceptions.filter'

async function bootstrap() {
	const app = await NestFactory.create(AppModule, { bufferLogs: true })

	app.useLogger(app.get(Logger))

	const config = app.get(ConfigService)

	app.use(helmet())
	app.enableCors({
		origin: config.getOrThrow<string[]>('CORS_ORIGINS'),
		credentials: true,
	})

	app.useGlobalPipes(
		new ValidationPipe({
			whitelist: true,
			transform: true,
			transformOptions: { enableImplicitConversion: true },
		}),
	)
	app.useGlobalFilters(new AllExceptionsFilter())

	if (config.get<string>('NODE_ENV', 'development') !== 'production') {
		const swaggerConfig = new DocumentBuilder()
			.setTitle('Bolão API')
			.setDescription('API do bolão da Copa do Mundo')
			.setVersion('1.0')
			.addBearerAuth(
				{ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
				'access-token',
			)
			.build()
		const document = SwaggerModule.createDocument(app, swaggerConfig)
		SwaggerModule.setup('api/docs', app, document, {
			swaggerOptions: { persistAuthorization: true },
		})
	}

	const port = config.getOrThrow<number>('PORT')
	await app.listen(port)
}

bootstrap()
