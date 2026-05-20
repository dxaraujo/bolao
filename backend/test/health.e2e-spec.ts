import request from 'supertest'

import { createTestApp, type TestApp } from './helpers/test-app'

describe('GET /healthcheck (e2e)', () => {
	let ctx: TestApp

	beforeAll(async () => {
		ctx = await createTestApp()
	})

	afterAll(async () => {
		await ctx.close()
	})

	it('retorna uptime, message OK e timestamp', async () => {
		const res = await request(ctx.app.getHttpServer()).get('/healthcheck').expect(200)

		expect(res.body).toEqual(
			expect.objectContaining({
				message: 'OK',
				uptime: expect.any(Number),
				timestamp: expect.any(Number),
			}),
		)
	})

	it('propaga X-Request-Id no response header', async () => {
		const res = await request(ctx.app.getHttpServer())
			.get('/healthcheck')
			.set('x-request-id', 'fixed-id-123')
			.expect(200)

		expect(res.headers['x-request-id']).toBe('fixed-id-123')
	})
})
