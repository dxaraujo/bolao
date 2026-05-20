import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model, Types } from 'mongoose'

import { Phase } from '../phase/schemas/phase.schema'
import { Match } from '../match/schemas/match.schema'
import { CreateBetDto } from './dto/create-bet.dto'
import { UpdateBetDto } from './dto/update-bet.dto'
import { BetUpdateItemDto } from './dto/update-bets.dto'
import { Bet, BetDocument } from './schemas/bet.schema'

export interface BetRodada {
	nome: string
	bets: BetDocument[]
}

export interface BetGrupo {
	nome: string
	rodadas: BetRodada[]
}

@Injectable()
export class BetService {

	constructor(
		@InjectModel(Bet.name) private readonly model: Model<Bet>,
		@InjectModel(Phase.name) private readonly phaseModel: Model<Phase>,
		@InjectModel(Match.name) private readonly matchModel: Model<Match>,
	) {}

	findAll(query: Record<string, unknown>) {
		return this.model.find(query).sort({ 'match.utcDate': 'asc' }).exec()
	}

	findById(id: string) {
		return this.model.findById(id).exec()
	}

	create(dto: CreateBetDto) {
		return this.model.create(dto)
	}

	async update(id: string, dto: UpdateBetDto) {
		const updated = await this.model.findByIdAndUpdate(id, dto, { new: true }).exec()
		if (!updated) throw new NotFoundException(`Bet ${id} não encontrado`)
		return updated
	}

	async remove(id: string) {
		const removed = await this.model.findByIdAndDelete(id).exec()
		if (!removed) throw new NotFoundException(`Bet ${id} não encontrado`)
		return removed
	}

	async updateBets(itens: BetUpdateItemDto[]) {
		const bets = await Promise.all(
			itens.map((item) =>
				this.model
					.findByIdAndUpdate(
						item._id,
						{ homeTeamScore: item.homeTeamScore, awayTeamScore: item.awayTeamScore },
						{ new: true },
					)
					.exec(),
			),
		)
		const filtrados = bets.filter((p): p is BetDocument => p !== null)
		return montarBets(filtrados)
	}

	async montarParaPhase(user: string, phaseId: string) {
		const phase = await this.phaseModel.findById(phaseId).exec()
		if (!phase) throw new NotFoundException(`Phase ${phaseId} não encontrada`)

		const existentes = await this.model.find({ user, 'match.stage': phase.name }).exec()
		if (existentes.length > 0) return montarBets(existentes)

		const matches = await this.matchModel
			.find({ stage: phase.name })
			.sort({ utcDate: 'asc' })
			.exec()

		const userId = new Types.ObjectId(user)
		const novos = matches.map((match) => {
			const { homeTeamScore, awayTeamScore, ...matchPlain } = match.toObject()
			void homeTeamScore
			void awayTeamScore
			return { user: userId, match: matchPlain }
		})
		const criados = await this.model.insertMany(novos)
		return montarBets(criados as BetDocument[])
	}
}

const montarBets = (bets: BetDocument[]): BetGrupo[] => {
	if (bets.length === 0) return []
	const ordenados = ordernarBets(bets)
	const grupos: BetGrupo[] = []
	let grupoAtual: BetGrupo | null = null
	let rodadaAtual: BetRodada | null = null

	for (const bet of ordenados) {
		const nomeGrupo = bet.match.group ?? ''
		const nomeRodada = bet.match.matchday != null ? String(bet.match.matchday) : ''
		if (!grupoAtual || grupoAtual.nome !== nomeGrupo) {
			grupoAtual = { nome: nomeGrupo, rodadas: [] }
			rodadaAtual = null
			grupos.push(grupoAtual)
		}
		if (!rodadaAtual || rodadaAtual.nome !== nomeRodada) {
			rodadaAtual = { nome: nomeRodada, bets: [] }
			grupoAtual.rodadas.push(rodadaAtual)
		}
		rodadaAtual.bets.push(bet)
	}
	return grupos
}

const ordernarBets = (bets: BetDocument[]): BetDocument[] =>
	[...bets].sort((p1, p2) => {
		const test = (p1.match.group ?? '').localeCompare(p2.match.group ?? '')
		if (test !== 0) return test
		const test1 = (p1.match.matchday ?? 0) - (p2.match.matchday ?? 0)
		if (test1 !== 0) return test1
		return p1.match.utcDate.valueOf() - p2.match.utcDate.valueOf()
	})
