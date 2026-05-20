import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model, Types } from 'mongoose'

import { Fase } from '../fase/schemas/fase.schema'
import { Partida } from '../partida/schemas/partida.schema'
import { CreatePalpiteDto } from './dto/create-palpite.dto'
import { UpdatePalpiteDto } from './dto/update-palpite.dto'
import { PalpiteUpdateItemDto } from './dto/update-palpites.dto'
import { Palpite, PalpiteDocument } from './schemas/palpite.schema'

export interface PalpiteRodada {
	nome: string
	palpites: PalpiteDocument[]
}

export interface PalpiteGrupo {
	nome: string
	rodadas: PalpiteRodada[]
}

@Injectable()
export class PalpiteService {
	constructor(
		@InjectModel(Palpite.name) private readonly model: Model<Palpite>,
		@InjectModel(Fase.name) private readonly faseModel: Model<Fase>,
		@InjectModel(Partida.name) private readonly partidaModel: Model<Partida>,
	) {}

	findAll(query: Record<string, unknown>) {
		return this.model.find(query).sort({ 'partida.order': 'asc' }).exec()
	}

	findById(id: string) {
		return this.model.findById(id).exec()
	}

	create(dto: CreatePalpiteDto) {
		return this.model.create(dto)
	}

	async update(id: string, dto: UpdatePalpiteDto) {
		const updated = await this.model.findByIdAndUpdate(id, dto, { new: true }).exec()
		if (!updated) throw new NotFoundException(`Palpite ${id} não encontrado`)
		return updated
	}

	async remove(id: string) {
		const removed = await this.model.findByIdAndDelete(id).exec()
		if (!removed) throw new NotFoundException(`Palpite ${id} não encontrado`)
		return removed
	}

	async updatePalpites(itens: PalpiteUpdateItemDto[]) {
		const palpites = await Promise.all(
			itens.map((item) =>
				this.model
					.findByIdAndUpdate(
						item._id,
						{ placarTimeA: item.placarTimeA, placarTimeB: item.placarTimeB },
						{ new: true },
					)
					.exec(),
			),
		)
		const filtrados = palpites.filter((p): p is PalpiteDocument => p !== null)
		return montarPalpites(filtrados)
	}

	async montarParaFase(user: string, faseId: string) {
		const fase = await this.faseModel.findById(faseId).exec()
		if (!fase) throw new NotFoundException(`Fase ${faseId} não encontrada`)

		const existentes = await this.model.find({ user, 'partida.fase': fase.nome }).exec()
		if (existentes.length > 0) return montarPalpites(existentes)

		const partidas = await this.partidaModel
			.find({ fase: fase.nome })
			.sort({ order: 'asc' })
			.exec()

		const userId = new Types.ObjectId(user)
		const novos = partidas.map((partida) => {
			const { placarTimeA, placarTimeB, ...partidaPlain } = partida.toObject()
			void placarTimeA
			void placarTimeB
			return { user: userId, partida: partidaPlain }
		})
		const criados = await this.model.insertMany(novos)
		return montarPalpites(criados as PalpiteDocument[])
	}
}

const montarPalpites = (palpites: PalpiteDocument[]): PalpiteGrupo[] => {
	if (palpites.length === 0) return []
	const ordenados = ordernarPalpites(palpites)
	const grupos: PalpiteGrupo[] = []
	let grupoAtual: PalpiteGrupo | null = null
	let rodadaAtual: PalpiteRodada | null = null

	for (const palpite of ordenados) {
		const nomeGrupo = palpite.partida.grupo ?? ''
		const nomeRodada = palpite.partida.rodada ?? ''
		if (!grupoAtual || grupoAtual.nome !== nomeGrupo) {
			grupoAtual = { nome: nomeGrupo, rodadas: [] }
			rodadaAtual = null
			grupos.push(grupoAtual)
		}
		if (!rodadaAtual || rodadaAtual.nome !== nomeRodada) {
			rodadaAtual = { nome: nomeRodada, palpites: [] }
			grupoAtual.rodadas.push(rodadaAtual)
		}
		rodadaAtual.palpites.push(palpite)
	}
	return grupos
}

const ordernarPalpites = (palpites: PalpiteDocument[]): PalpiteDocument[] =>
	[...palpites].sort((p1, p2) => {
		const test = (p1.partida.grupo ?? '').localeCompare(p2.partida.grupo ?? '')
		if (test !== 0) return test
		const test1 = (p1.partida.rodada ?? '').localeCompare(p2.partida.rodada ?? '')
		if (test1 !== 0) return test1
		return p1.partida.order - p2.partida.order
	})
