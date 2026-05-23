import { NestFactory } from '@nestjs/core'
import { NestExpressApplication } from '@nestjs/platform-express'
import { ConfigService } from '@nestjs/config'
import { Logger, ValidationPipe } from '@nestjs/common'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import helmet from 'helmet'
import * as path from 'node:path'

import { AppModule } from './app.module'
import { AllExceptionsFilter } from './common/all-exceptions.filter'
import { SWAGGER_BEARER_AUTH } from './common/swagger-auth.decorator'

async function bootstrap() {
	const app = await NestFactory.create<NestExpressApplication>(AppModule)
	const config = app.get(ConfigService)
	const logger = new Logger('Bootstrap')

	app.use(helmet())

	const staticDir = path.resolve(process.cwd(), config.get<string>('STATIC_DIR') ?? 'static')
	app.useStaticAssets(staticDir, {
		prefix: '/static/',
		setHeaders: (res) => {
			res.setHeader('Cache-Control', 'public, max-age=31536000, immutable')
		},
	})

	logger.log(`Static assets served from ${staticDir} at /static/`)

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
				SWAGGER_BEARER_AUTH,
			)
			.build()
		const document = SwaggerModule.createDocument(app, swaggerConfig)
		SwaggerModule.setup('api/docs', app, document, {
			swaggerOptions: { persistAuthorization: true },
		})
	}

	const port = config.getOrThrow<number>('PORT')
	await app.listen(port, '0.0.0.0')

	logger.log(`API listening on port ${port}`)
}

bootstrap()
