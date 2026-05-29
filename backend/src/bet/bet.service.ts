import {
	calculateBetScore,
	getStageState,
	MatchStatus,
	StageState,
	type GroupedBetMatch,
	type GroupedBetParticipant,
	type MatchPayload,
	type MyBetItem,
	type TeamPayload,
} from '@bolao/shared'
import { BadRequestException, ConflictException, ForbiddenException, Injectable, Logger, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { AnyBulkWriteOperation, Model, Types } from 'mongoose'

import { Match, MatchDocument } from '../match/schemas/match.schema'
import { Stage, StageDocument } from '../stage/schemas/stage.schema'
import { StageService } from '../stage/stage.service'
import { TeamDocument } from '../team/schemas/team.schema'
import { User } from '../user/schemas/user.schema'
import { BetSubmitDto, BetSubmitItemDto } from './dto/update-bets.dto'
import { Bet, BetDocument } from './schemas/bet.schema'

@Injectable()
export class BetService {
	private readonly logger = new Logger(BetService.name)

	constructor(
		@InjectModel(Bet.name) private readonly model: Model<Bet>,
		@InjectModel(Match.name) private readonly matchModel: Model<Match>,
		@InjectModel(Stage.name) private readonly stageModel: Model<Stage>,
		@InjectModel(User.name) private readonly userModel: Model<User>,
		private readonly stageService: StageService,
	) {}

	/**
	 * Lista as partidas visíveis (fases OPEN/CLOSED) com o palpite do usuário, se existir.
	 */
	async listMine(userId: string): Promise<MyBetItem[]> {
		if (!Types.ObjectId.isValid(userId)) throw new NotFoundException(`Usuário ${userId} inválido`)

		const stages = await this.stageService.findAll()
		const now = new Date()
		const all = stages.map((s) => ({ code: s.code, deadline: s.deadline }))
		const visibleStageIds = stages.filter((s) => getStageState({ code: s.code, deadline: s.deadline }, all, now) !== StageState.LOCKED).map((s) => s._id)

		const matches = await this.matchModel
			.find({ stage: { $in: visibleStageIds } })
			.sort({ utcDate: 1, footballDataId: 1 })
			.populate<{ homeTeam: TeamDocument; awayTeam: TeamDocument }>(['homeTeam', 'awayTeam'])
			.populate<{ stage: StageDocument }>('stage')
			.exec()

		const matchIds = matches.map((m) => m._id)
		const bets = await this.model.find({ user: userId, match: { $in: matchIds } }).exec()
		const betByMatch = new Map(bets.map((b) => [b.match.toString(), b]))

		return matches.map((m) => {
			const stage = m.stage as unknown as StageDocument
			const stageState = getStageState({ code: stage.code, deadline: stage.deadline }, all, now)
			const matchPayload: MatchPayload = {
				_id: m._id.toString(),
				footballDataId: m.footballDataId,
				utcDate: m.utcDate.toISOString(),
				status: m.status,
				stage: stage.code,
				stageState,
				group: m.group,
				homeTeam: teamPayload(m.homeTeam),
				awayTeam: teamPayload(m.awayTeam),
				score: m.score ? { home: m.score.home, away: m.score.away } : undefined,
			}
			const bet = betByMatch.get(m._id.toString())
			if (!bet) return { match: matchPayload }
			const matchScore = m.score ? { home: m.score.home, away: m.score.away } : null
			const result = calculateBetScore(bet.score, matchScore)
			return {
				match: matchPayload,
				bet: {
					_id: bet._id.toString(),
					score: { home: bet.score.home, away: bet.score.away },
					updatedAt: (bet as BetDocument & { updatedAt?: Date }).updatedAt?.toISOString() ?? new Date().toISOString(),
				},
				result,
			}
		})
	}

	/**
	 * Submete palpites em lote: score → upsert, score: null → delete.
	 * Validação em cascata (cada item), atômica via bulkWrite ordenado.
	 */
	async submit(userId: string, dto: BetSubmitDto): Promise<{ upserted: number; deleted: number }> {
		if (!Types.ObjectId.isValid(userId)) throw new NotFoundException(`Usuário ${userId} inválido`)

		const user = await this.userModel.findById(userId).exec()
		if (!user) throw new NotFoundException(`Usuário ${userId} não encontrado`)
		if (!user.isActive) throw new ForbiddenException('Apenas participantes ativos podem enviar palpites')

		const stages = await this.stageService.findAll()
		const now = new Date()
		const all = stages.map((s) => ({ code: s.code, deadline: s.deadline }))
		const stateByStageId = new Map<string, StageState>(
			stages.map((s) => [s._id.toString(), getStageState({ code: s.code, deadline: s.deadline }, all, now)]),
		)

		const matchIds = dto.items.map((i) => new Types.ObjectId(i.matchId))
		const matches = await this.matchModel.find({ _id: { $in: matchIds } }).exec()
		const matchById = new Map(matches.map((m) => [m._id.toString(), m]))

		for (const item of dto.items) {
			this.validateItem(item, matchById.get(item.matchId), stateByStageId)
		}

		const userObjId = new Types.ObjectId(userId)
		const ops: AnyBulkWriteOperation<Bet>[] = dto.items.map((item) =>
			item.score
				? {
						updateOne: {
							filter: { user: userObjId, match: new Types.ObjectId(item.matchId) },
							update: { $set: { score: { home: item.score.home, away: item.score.away } } },
							upsert: true,
						},
					}
				: {
						deleteOne: {
							filter: { user: userObjId, match: new Types.ObjectId(item.matchId) },
						},
					},
		)

		const result = await this.model.bulkWrite(ops, { ordered: true })
		const upserted = (result.upsertedCount ?? 0) + (result.modifiedCount ?? 0)
		const deleted = result.deletedCount ?? 0
		this.logger.log(`User ${userId} submit: upserted=${upserted}, deleted=${deleted}`)
		return { upserted, deleted }
	}

	private validateItem(item: BetSubmitItemDto, match: MatchDocument | undefined, stateByStageId: Map<string, StageState>) {
		if (!match) throw new NotFoundException(`Partida ${item.matchId} não encontrada`)
		if (!match.homeTeam || !match.awayTeam) {
			throw new ConflictException(`Partida ${item.matchId} sem times resolvidos`)
		}
		const stageState = stateByStageId.get(match.stage.toString()) ?? StageState.LOCKED
		if (stageState !== StageState.OPEN) {
			throw new ConflictException(`Fase da partida ${item.matchId} não está aberta (${stageState})`)
		}
		if (match.status !== MatchStatus.SCHEDULED) {
			throw new ConflictException(`Partida ${item.matchId} já iniciou ou foi finalizada (${match.status})`)
		}
		if (item.score) {
			if (!Number.isInteger(item.score.home) || !Number.isInteger(item.score.away)) {
				throw new BadRequestException(`Placar inválido para partida ${item.matchId}`)
			}
		}
	}

	/**
	 * Agregado para /bolao — partidas em fases CLOSED, com palpites de todos os ativos.
	 */
	async listGrouped(): Promise<GroupedBetMatch[]> {
		const stages = await this.stageService.findAll()
		const now = new Date()
		const all = stages.map((s) => ({ code: s.code, deadline: s.deadline }))
		const closedStageIds = stages.filter((s) => getStageState({ code: s.code, deadline: s.deadline }, all, now) === StageState.CLOSED).map((s) => s._id)

		if (closedStageIds.length === 0) return []

		const matches = await this.matchModel
			.find({ stage: { $in: closedStageIds } })
			.sort({ utcDate: 1, footballDataId: 1 })
			.populate<{ homeTeam: TeamDocument; awayTeam: TeamDocument }>(['homeTeam', 'awayTeam'])
			.populate<{ stage: StageDocument }>('stage')
			.exec()

		const matchIds = matches.map((m) => m._id)
		const activeUsers = await this.userModel.find({ isActive: true }).sort({ name: 1 }).exec()
		const activeUserIds = activeUsers.map((u) => u._id)

		const bets = await this.model.find({ match: { $in: matchIds }, user: { $in: activeUserIds } }).exec()
		const betByMatchUser = new Map<string, BetDocument>(bets.map((b) => [`${b.match.toString()}:${b.user.toString()}`, b]))

		return matches.map((m) => {
			const stage = m.stage as unknown as StageDocument
			const matchScore = m.score ? { home: m.score.home, away: m.score.away } : null
			const matchPayload: MatchPayload = {
				_id: m._id.toString(),
				footballDataId: m.footballDataId,
				utcDate: m.utcDate.toISOString(),
				status: m.status,
				stage: stage.code,
				stageState: StageState.CLOSED,
				group: m.group,
				homeTeam: teamPayload(m.homeTeam),
				awayTeam: teamPayload(m.awayTeam),
				score: matchScore ?? undefined,
			}
			const totals = { exactScore: 0, winnerWithGoal: 0, correctWinner: 0, oneGoalCorrect: 0, wrong: 0, notBet: 0, total: 0 }
			const participants: GroupedBetParticipant[] = activeUsers.map((u) => {
				totals.total++
				const bet = betByMatchUser.get(`${m._id.toString()}:${u._id.toString()}`)
				if (!bet) {
					totals.notBet++
					return {
						user: { _id: u._id.toString(), name: u.name, avatar: u.avatar },
					}
				}
				const result = calculateBetScore(bet.score, matchScore)
				if (result.exactScore) totals.exactScore++
				if (result.winnerWithGoal) totals.winnerWithGoal++
				if (result.correctWinner) totals.correctWinner++
				if (result.oneGoalCorrect) totals.oneGoalCorrect++
				if (result.wrong) totals.wrong++
				return {
					user: { _id: u._id.toString(), name: u.name, avatar: u.avatar },
					score: { home: bet.score.home, away: bet.score.away },
					result,
				}
			})
			return { match: matchPayload, totals, participants }
		})
	}
}

function teamPayload(t: TeamDocument): TeamPayload {
	return {
		_id: t._id.toString(),
		name: t.name,
		shortName: t.shortName,
		tla: t.tla,
		flagEmoji: t.flagEmoji,
		crest: t.crest,
	}
}
