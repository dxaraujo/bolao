import { calcularPontuacaoBet, classificar, type UserAggregate } from './result.service'
import type { BetDocument } from '../bet/schemas/bet.schema'
import type { MatchDocument } from './schemas/match.schema'

// Cria um stub de BetDocument com apenas os campos necessários para a lógica de pontuação.
const makeBet = (homeTeamScore?: number, awayTeamScore?: number): BetDocument =>
	({
		homeTeamScore,
		awayTeamScore,
		totalPontosObitidos: 0,
		placarCheio: false,
		placarTimeVencedorComGol: false,
		placarTimeVencedor: false,
		placarGol: false,
	}) as unknown as BetDocument

const makeMatch = (homeTeamScore: number, awayTeamScore: number): MatchDocument =>
	({ homeTeamScore, awayTeamScore }) as unknown as MatchDocument

describe('calcularPontuacaoBet', () => {
	const match = makeMatch(2, 1)

	it('5 pontos quando o placar é cravado', () => {
		const bet = makeBet(2, 1)
		calcularPontuacaoBet(bet, match)
		expect(bet.totalPontosObitidos).toBe(5)
		expect(bet.placarCheio).toBe(true)
	})

	it('3 pontos quando acerta vencedor + um dos gols', () => {
		const bet = makeBet(2, 0) // mesmo vencedor (A) e acertou homeTeamScore
		calcularPontuacaoBet(bet, match)
		expect(bet.totalPontosObitidos).toBe(3)
		expect(bet.placarTimeVencedorComGol).toBe(true)
		expect(bet.placarCheio).toBe(false)
	})

	it('2 pontos quando acerta só o vencedor (sem nenhum gol certo)', () => {
		const bet = makeBet(3, 0)
		calcularPontuacaoBet(bet, match)
		expect(bet.totalPontosObitidos).toBe(2)
		expect(bet.placarTimeVencedor).toBe(true)
	})

	it('1 ponto quando erra o vencedor mas acerta um dos gols', () => {
		const bet = makeBet(1, 1) // vencedor errado (E vs A), mas placar do timeB bate (1)
		calcularPontuacaoBet(bet, match)
		expect(bet.totalPontosObitidos).toBe(1)
		expect(bet.placarGol).toBe(true)
	})

	it('0 pontos quando erra tudo', () => {
		const bet = makeBet(0, 5)
		calcularPontuacaoBet(bet, match)
		expect(bet.totalPontosObitidos).toBe(0)
		expect(bet.placarCheio).toBe(false)
		expect(bet.placarTimeVencedorComGol).toBe(false)
		expect(bet.placarTimeVencedor).toBe(false)
		expect(bet.placarGol).toBe(false)
	})

	it('zera pontuação quando o palpite não tem placares', () => {
		const bet = makeBet(undefined, undefined)
		calcularPontuacaoBet(bet, match)
		expect(bet.totalPontosObitidos).toBe(0)
	})

	it('pontua empate cravado', () => {
		const empate = makeMatch(1, 1)
		const bet = makeBet(1, 1)
		calcularPontuacaoBet(bet, empate)
		expect(bet.totalPontosObitidos).toBe(5)
		expect(bet.placarCheio).toBe(true)
	})

	it('acerta empate sem cravar placar = 2 pontos', () => {
		const empate = makeMatch(1, 1)
		const bet = makeBet(2, 2) // empate certo, mas placar errado
		calcularPontuacaoBet(bet, empate)
		expect(bet.totalPontosObitidos).toBe(2)
		expect(bet.placarTimeVencedor).toBe(true)
	})
})

describe('classificar', () => {
	const makeUser = (id: string, fields: Partial<UserAggregate>): UserAggregate =>
		({
			_id: id,
			totalAcumulado: 0,
			classificacao: 0,
			classificacaoAnterior: 0,
			placarCheio: 0,
			placarTimeVencedorComGol: 0,
			placarTimeVencedor: 0,
			placarGol: 0,
			bets: [],
			...fields,
		}) as unknown as UserAggregate

	it('ordena por totalAcumulado desc e atribui posições 1, 2, 3', () => {
		const users = [
			makeUser('a', { totalAcumulado: 10 }),
			makeUser('b', { totalAcumulado: 30 }),
			makeUser('c', { totalAcumulado: 20 }),
		]
		const sorted = classificar(users, 0)
		expect(sorted.map((u) => u._id)).toEqual(['b', 'c', 'a'])
		expect(sorted.map((u) => u.classificacao)).toEqual([1, 2, 3])
	})

	it('empate no totalAcumulado é resolvido pelo placarCheio (mais cravadas vence)', () => {
		const users = [
			makeUser('a', { totalAcumulado: 10, placarCheio: 1 }),
			makeUser('b', { totalAcumulado: 10, placarCheio: 3 }),
		]
		const sorted = classificar(users, 0)
		expect(sorted[0]._id).toBe('b')
		expect(sorted[1]._id).toBe('a')
	})

	it('empate em TODOS os critérios faz dois usuários compartilharem a posição', () => {
		const users = [
			makeUser('a', { totalAcumulado: 10, placarCheio: 1, placarTimeVencedorComGol: 1 }),
			makeUser('b', { totalAcumulado: 10, placarCheio: 1, placarTimeVencedorComGol: 1 }),
			makeUser('c', { totalAcumulado: 5 }),
		]
		const sorted = classificar(users, 0)
		// a e b empatados → ambos em 1º; c salta para 3º
		expect(sorted[0].classificacao).toBe(1)
		expect(sorted[1].classificacao).toBe(1)
		expect(sorted[2].classificacao).toBe(3)
	})

	it('com index > 0, preserva classificacaoAnterior', () => {
		const users = [makeUser('a', { totalAcumulado: 10, classificacao: 5 })]
		const sorted = classificar(users, 2)
		expect(sorted[0].classificacaoAnterior).toBe(5)
	})
})
