import { Injectable, Logger } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'

import { AppConfigService } from '../config/config.service'
import { Palpite, PalpiteDocument } from '../palpite/schemas/palpite.schema'
import { User, UserDocument } from '../user/schemas/user.schema'
import { Partida, PartidaDocument } from './schemas/partida.schema'

interface ResultadoInput {
	placarTimeA?: number
	placarTimeB?: number
}

interface UserAggregate {
	_id: UserDocument['_id']
	totalAcumulado: number
	classificacao: number
	classificacaoAnterior: number
	placarCheio: number
	placarTimeVencedorComGol: number
	placarTimeVencedor: number
	placarGol: number
	palpites: PalpiteDocument[]
}

const isValidPlacar = (value: unknown): value is number =>
	typeof value === 'number' && Number.isFinite(value) && value >= 0

@Injectable()
export class ResultadoService {
	private readonly logger = new Logger(ResultadoService.name)

	constructor(
		@InjectModel(Partida.name) private readonly partidaModel: Model<Partida>,
		@InjectModel(Palpite.name) private readonly palpiteModel: Model<Palpite>,
		@InjectModel(User.name) private readonly userModel: Model<User>,
		private readonly appConfig: AppConfigService,
	) {}

	async atualizarResultados(partidaId: string, { placarTimeA, placarTimeB }: ResultadoInput) {
		this.logger.log(
			`Atualizando resultado partida ${partidaId}: ${placarTimeA} x ${placarTimeB}`,
		)

		await this.appConfig.setAtualizandoPontuacoes(true)
		try {
			const newPartida = await this.partidaModel
				.findByIdAndUpdate(partidaId, { placarTimeA, placarTimeB }, { new: true })
				.exec()

			const [partidas, allPalpites, usersDoc] = await Promise.all([
				this.partidaModel.find({}).sort({ order: 'asc' }).exec(),
				this.palpiteModel.find({}).sort({ 'partida.order': 'asc' }).exec(),
				this.userModel.find({ ativo: true }).exec(),
			])

			let users: UserAggregate[] = usersDoc.map((user) => ({
				_id: user._id,
				totalAcumulado: 0,
				classificacao: 0,
				classificacaoAnterior: 0,
				placarCheio: 0,
				placarTimeVencedorComGol: 0,
				placarTimeVencedor: 0,
				placarGol: 0,
				palpites: allPalpites.filter((p) => p.user.equals(user._id)),
			}))

			for (let i = 0; i < partidas.length; i++) {
				const partida = partidas[i]
				if (!isValidPlacar(partida.placarTimeA) || !isValidPlacar(partida.placarTimeB)) continue

				for (const user of users) {
					const palpite = findPalpite(user.palpites, partida)
					if (palpite == null) continue
					calcularPontuacaoPalpite(palpite, partida)
					user.totalAcumulado += palpite.totalPontosObitidos
					user.placarCheio += palpite.placarCheio ? 1 : 0
					user.placarTimeVencedorComGol += palpite.placarTimeVencedorComGol ? 1 : 0
					user.placarTimeVencedor += palpite.placarTimeVencedor ? 1 : 0
					user.placarGol += palpite.placarGol ? 1 : 0
					palpite.totalAcumulado = user.totalAcumulado
				}
				users = classificar(users, i)
				for (const user of users) {
					const palpite = findPalpite(user.palpites, partida)
					if (palpite == null) continue
					palpite.classificacao = user.classificacao
					palpite.classificacaoAnterior = user.classificacaoAnterior
				}
			}

			await Promise.all(
				users.flatMap((user) => {
					const palpiteUpdates = user.palpites.map((palpite) =>
						this.palpiteModel
							.findByIdAndUpdate(
								palpite._id,
								{
									totalPontosObitidos: palpite.totalPontosObitidos,
									totalAcumulado: palpite.totalAcumulado,
									classificacao: palpite.classificacao,
									classificacaoAnterior: palpite.classificacaoAnterior,
									placarCheio: palpite.placarCheio,
									placarTimeVencedorComGol: palpite.placarTimeVencedorComGol,
									placarTimeVencedor: palpite.placarTimeVencedor,
									placarGol: palpite.placarGol,
								},
								{ new: true },
							)
							.exec(),
					)
					const userUpdate = this.userModel
						.findByIdAndUpdate(
							user._id,
							{
								totalAcumulado: user.totalAcumulado,
								classificacao: user.classificacao,
								classificacaoAnterior: user.classificacaoAnterior,
								placarCheio: user.placarCheio,
								placarTimeVencedorComGol: user.placarTimeVencedorComGol,
								placarTimeVencedor: user.placarTimeVencedor,
								placarGol: user.placarGol,
							},
							{ new: true },
						)
						.exec()
					return [...palpiteUpdates, userUpdate]
				}),
			)

			this.logger.log(
				`Partida atualizada ${newPartida?._id}: ${newPartida?.placarTimeA} x ${newPartida?.placarTimeB}`,
			)
			return newPartida
		} finally {
			await this.appConfig.setAtualizandoPontuacoes(false)
		}
	}
}

const findPalpite = (palpites: PalpiteDocument[], partida: PartidaDocument) =>
	palpites.find(
		(palpite) =>
			palpite.partida.fase === partida.fase &&
			palpite.partida.grupo === partida.grupo &&
			palpite.partida.rodada === partida.rodada &&
			palpite.partida.timeA?.nome === partida.timeA?.nome &&
			palpite.partida.timeB?.nome === partida.timeB?.nome,
	)

const calcularPontuacaoPalpite = (palpite: PalpiteDocument, partida: PartidaDocument) => {
	if (!isValidPlacar(palpite.placarTimeA) || !isValidPlacar(palpite.placarTimeB)) {
		zerarPontuacao(palpite)
		return
	}
	const palpiteVencedor = vencedor(palpite.placarTimeA, palpite.placarTimeB)
	const partidaVencedor = vencedor(partida.placarTimeA!, partida.placarTimeB!)

	if (
		palpite.placarTimeA === partida.placarTimeA &&
		palpite.placarTimeB === partida.placarTimeB
	) {
		palpite.totalPontosObitidos = 5
		palpite.placarCheio = true
		palpite.placarTimeVencedorComGol = false
		palpite.placarTimeVencedor = false
		palpite.placarGol = false
		return
	}

	if (palpiteVencedor === partidaVencedor) {
		const acertouUmGol =
			palpite.placarTimeA === partida.placarTimeA || palpite.placarTimeB === partida.placarTimeB
		palpite.totalPontosObitidos = acertouUmGol ? 3 : 2
		palpite.placarCheio = false
		palpite.placarTimeVencedorComGol = acertouUmGol
		palpite.placarTimeVencedor = !acertouUmGol
		palpite.placarGol = false
		return
	}

	const acertouSoUmGol =
		palpite.placarTimeA === partida.placarTimeA || palpite.placarTimeB === partida.placarTimeB
	palpite.totalPontosObitidos = acertouSoUmGol ? 1 : 0
	palpite.placarCheio = false
	palpite.placarTimeVencedorComGol = false
	palpite.placarTimeVencedor = false
	palpite.placarGol = acertouSoUmGol
}

const zerarPontuacao = (palpite: PalpiteDocument) => {
	palpite.totalPontosObitidos = 0
	palpite.placarCheio = false
	palpite.placarTimeVencedorComGol = false
	palpite.placarTimeVencedor = false
	palpite.placarGol = false
}

const vencedor = (placarA: number, placarB: number): 'A' | 'B' | 'E' =>
	placarA > placarB ? 'A' : placarB > placarA ? 'B' : 'E'

const classificar = (users: UserAggregate[], index: number): UserAggregate[] => {
	users.sort(compararUsuarios)
	let cla = 1
	let mesmoplacar = 1
	for (let i = 0; i < users.length; i++) {
		if (i > 0) {
			if (compararUsuarios(users[i], users[i - 1]) === 0) {
				cla = users[i - 1].classificacao
				mesmoplacar += 1
			} else {
				cla = cla + mesmoplacar
				mesmoplacar = 1
			}
		}
		users[i].classificacaoAnterior = index > 0 ? users[i].classificacao : 0
		users[i].classificacao = cla
	}
	return users
}

const compararUsuarios = (u1: UserAggregate, u2: UserAggregate): number =>
	u2.totalAcumulado - u1.totalAcumulado ||
	u2.placarCheio - u1.placarCheio ||
	u2.placarTimeVencedorComGol - u1.placarTimeVencedorComGol ||
	u2.placarTimeVencedor - u1.placarTimeVencedor ||
	u2.placarGol - u1.placarGol
