import { ExecutionContext, INestApplication, ValidationPipe } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'
import { MongooseModule } from '@nestjs/mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'

import { AppModule } from 'src/app.module'
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard'
import { AllExceptionsFilter } from 'src/common/all-exceptions.filter'

export interface TestApp {
	app: INestApplication
	mongo: MongoMemoryServer
	close: () => Promise<void>
}

/**
 * Sobe uma instância completa da app contra um MongoDB in-memory.
 * O JwtAuthGuard é substituído por um stub que sempre libera (usar `setAuth(userPayload)` no teste).
 */
export async function createTestApp(env: Record<string, string> = {}): Promise<TestApp> {
	const mongo = await MongoMemoryServer.create()

	process.env.NODE_ENV = 'test'
	process.env.AUTH_SECRET = env.AUTH_SECRET ?? 'test-secret'
	process.env.GOOGLE_CLIENT_ID = env.GOOGLE_CLIENT_ID ?? 'test-google-id'
	process.env.FOOTBALL_DATA_API_URL = env.FOOTBALL_DATA_API_URL ?? 'http://example.test/api'
	process.env.FOOTBALL_DATA_API_KEY = env.FOOTBALL_DATA_API_KEY ?? 'test-football-data-api-key'
	process.env.MONGODB_URI = mongo.getUri()
	process.env.CORS_ORIGINS = env.CORS_ORIGINS ?? 'http://localhost:3000'

	const moduleRef: TestingModule = await Test.createTestingModule({
		imports: [AppModule],
	})
		.overrideGuard(JwtAuthGuard)
		.useValue({
			canActivate: (ctx: ExecutionContext) => {
				const req = ctx.switchToHttp().getRequest<{ user?: unknown }>()
				req.user = (globalThis as { __TEST_AUTH_USER__?: unknown }).__TEST_AUTH_USER__ ?? {
					_id: '000000000000000000000001',
					email: 'test@example.com',
					name: 'Test User',
					ativo: true,
					isAdmin: true,
				}
				return true
			},
		})
		.compile()

	const app = moduleRef.createNestApplication()
	app.useGlobalPipes(
		new ValidationPipe({
			whitelist: true,
			transform: true,
			transformOptions: { enableImplicitConversion: true },
		}),
	)
	app.useGlobalFilters(new AllExceptionsFilter())
	await app.init()

	// Silencia ConfigModule e MongooseModule não usados (apenas anti-warning)
	void ConfigModule
	void MongooseModule

	return {
		app,
		mongo,
		close: async () => {
			await app.close()
			await mongo.stop()
		},
	}
}
