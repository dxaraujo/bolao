import { Injectable, Logger } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'

import { AppConfigService } from '../config/config.service'
import { Bet, BetDocument, BetPopulated } from '../bet/schemas/bet.schema'
import { User, UserDocument } from '../user/schemas/user.schema'
import { Match, MatchDocument } from './schemas/match.schema'

interface ResultInput {
	homeTeamScore?: number
	awayTeamScore?: number
}

export interface UserAggregate {
	_id: UserDocument['_id']
	totalAcumulado: number
	classificacao: number
	classificacaoAnterior: number
	placarCheio: number
	placarTimeVencedorComGol: number
	placarTimeVencedor: number
	placarGol: number
	bets: BetPopulated[]
}

const isValidPlacar = (value: unknown): value is number =>
	typeof value === 'number' && Number.isFinite(value) && value >= 0

@Injectable()
export class ResultService {

	private readonly logger = new Logger(ResultService.name)

	constructor(
		@InjectModel(Match.name) private readonly matchModel: Model<Match>,
		@InjectModel(Bet.name) private readonly betModel: Model<Bet>,
		@InjectModel(User.name) private readonly userModel: Model<User>,
		private readonly appConfig: AppConfigService,
	) { }

	async atualizarResults(matchId: string, { homeTeamScore, awayTeamScore }: ResultInput) {
		this.logger.log(`Updating result for match ${matchId}: ${homeTeamScore} x ${awayTeamScore}`)

		await this.appConfig.setUpdatingScores(true)
		try {
			const newMatch = await this.matchModel
				.findByIdAndUpdate(matchId, { homeTeamScore, awayTeamScore }, { new: true })
				.exec()

			const [matches, allBets, usersDoc] = await Promise.all([
				this.matchModel.find({}).sort({ utcDate: 'asc' }).exec(),
				this.betModel.find({}).populate('match').exec(),
				this.userModel.find({ isActive: true }).exec(),
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
				bets: allBets.filter((p) => p.user.equals(user._id)) as unknown as BetPopulated[],
			}))

			for (let i = 0; i < matches.length; i++) {
				const match = matches[i]
				if (!isValidPlacar(match.homeTeamScore) || !isValidPlacar(match.awayTeamScore)) continue

				for (const user of users) {
					const bet = findBet(user.bets, match)
					if (bet == null) continue
					calcularPontuacaoBet(bet, match)
					user.totalAcumulado += bet.totalPointsEarned
					user.placarCheio += bet.exactScore ? 1 : 0
					user.placarTimeVencedorComGol += bet.winnerWithGoal ? 1 : 0
					user.placarTimeVencedor += bet.correctWinner ? 1 : 0
					user.placarGol += bet.oneGoalCorrect ? 1 : 0
					bet.cumulativeTotal = user.totalAcumulado
				}
				users = classificar(users, i)
				for (const user of users) {
					const bet = findBet(user.bets, match)
					if (bet == null) continue
					bet.ranking = user.classificacao
					bet.previousRanking = user.classificacaoAnterior
				}
			}

			await Promise.all(
				users.flatMap((user) => {
					const betUpdates = user.bets.map((bet) =>
						this.betModel
							.findByIdAndUpdate(
								bet._id,
								{
									totalPointsEarned: bet.totalPointsEarned,
									cumulativeTotal: bet.cumulativeTotal,
									ranking: bet.ranking,
									previousRanking: bet.previousRanking,
									exactScore: bet.exactScore,
									winnerWithGoal: bet.winnerWithGoal,
									correctWinner: bet.correctWinner,
									oneGoalCorrect: bet.oneGoalCorrect,
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
					return [...betUpdates, userUpdate]
				}),
			)

			this.logger.log(`Updated match ${newMatch?._id}: ${newMatch?.homeTeamScore} x ${newMatch?.awayTeamScore}`)
			return newMatch
		} finally {
			await this.appConfig.setUpdatingScores(false)
		}
	}
}

const findBet = (bets: BetPopulated[], match: MatchDocument) =>
	bets.find((bet) => bet.match.footballDataId === match.footballDataId)

// Exportado para testes unitários (lógica de pontuação isolada, sem depender do Mongoose)
export const calcularPontuacaoBet = (bet: BetPopulated, match: MatchDocument) => {
	if (!isValidPlacar(bet.homeTeamScore) || !isValidPlacar(bet.awayTeamScore)) {
		zerarPontuacao(bet)
		return
	}
	const betVencedor = vencedor(bet.homeTeamScore, bet.awayTeamScore)
	const matchVencedor = vencedor(match.homeTeamScore!, match.awayTeamScore!)

	if (
		bet.homeTeamScore === match.homeTeamScore &&
		bet.awayTeamScore === match.awayTeamScore
	) {
		bet.totalPointsEarned = 5
		bet.exactScore = true
		bet.winnerWithGoal = false
		bet.correctWinner = false
		bet.oneGoalCorrect = false
		return
	}

	if (betVencedor === matchVencedor) {
		const scoredOneGoal =
			bet.homeTeamScore === match.homeTeamScore ||
			bet.awayTeamScore === match.awayTeamScore
		bet.totalPointsEarned = scoredOneGoal ? 3 : 2
		bet.exactScore = false
		bet.winnerWithGoal = scoredOneGoal
		bet.correctWinner = !scoredOneGoal
		bet.oneGoalCorrect = false
		return
	}

	const scoredOnlyOneGoal =
		bet.homeTeamScore === match.homeTeamScore ||
		bet.awayTeamScore === match.awayTeamScore
	bet.totalPointsEarned = scoredOnlyOneGoal ? 1 : 0
	bet.exactScore = false
	bet.winnerWithGoal = false
	bet.correctWinner = false
	bet.oneGoalCorrect = scoredOnlyOneGoal
}

const zerarPontuacao = (bet: BetPopulated) => {
	bet.totalPointsEarned = 0
	bet.exactScore = false
	bet.winnerWithGoal = false
	bet.correctWinner = false
	bet.oneGoalCorrect = false
}

const vencedor = (placarA: number, placarB: number): 'A' | 'B' | 'E' =>
	placarA > placarB ? 'A' : placarB > placarA ? 'B' : 'E'

export const classificar = (users: UserAggregate[], index: number): UserAggregate[] => {
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
