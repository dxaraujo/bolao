import request from 'supertest'

import { createTestApp, type TestApp } from './helpers/test-app'

describe('Team CRUD (e2e)', () => {
	let ctx: TestApp
	let createdId: string

	beforeAll(async () => {
		ctx = await createTestApp()
	})

	afterAll(async () => {
		await ctx.close()
	})

	it('POST /api/team cria um time', async () => {
		const res = await request(ctx.app.getHttpServer())
			.post('/api/team')
			.send({ nome: 'Brasil', sigla: 'BRA', bandeira: 'br' })
			.expect(201)

		expect(res.body.data).toMatchObject({ nome: 'Brasil', sigla: 'BRA', bandeira: 'br' })
		expect(res.body.data._id).toBeDefined()
		createdId = res.body.data._id
	})

	it('GET /api/team lista os times', async () => {
		const res = await request(ctx.app.getHttpServer()).get('/api/team').expect(200)
		expect(Array.isArray(res.body.data)).toBe(true)
		expect(res.body.data.length).toBeGreaterThanOrEqual(1)
	})

	it('GET /api/team/:id retorna o time criado', async () => {
		const res = await request(ctx.app.getHttpServer())
			.get(`/api/team/${createdId}`)
			.expect(200)
		expect(res.body.data._id).toBe(createdId)
	})

	it('PUT /api/team/:id atualiza a sigla', async () => {
		const res = await request(ctx.app.getHttpServer())
			.put(`/api/team/${createdId}`)
			.send({ sigla: 'BRZ' })
			.expect(200)
		expect(res.body.data.sigla).toBe('BRZ')
	})

	it('DELETE /api/team/:id remove o time', async () => {
		await request(ctx.app.getHttpServer()).delete(`/api/team/${createdId}`).expect(200)

		const after = await request(ctx.app.getHttpServer()).get('/api/team').expect(200)
		expect(after.body.data.find((t: { _id: string }) => t._id === createdId)).toBeUndefined()
	})

	it('POST /api/team rejeita payload inválido (nome ausente)', async () => {
		const res = await request(ctx.app.getHttpServer())
			.post('/api/team')
			.send({ sigla: 'XYZ', bandeira: 'xx' })
			.expect(400)

		expect(res.body.errors).toBeDefined()
		expect(res.body.statusCode).toBe(400)
	})
})
