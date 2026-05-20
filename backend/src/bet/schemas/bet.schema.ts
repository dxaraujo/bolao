import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument, Schema as MongooseSchema, Types } from 'mongoose'
import { PONTOS_VALIDOS, type PontosObtidos } from '@bolao/shared'

import { Match, MatchSchema } from '../../match/schemas/match.schema'

export type BetDocument = HydratedDocument<Bet>
export { PONTOS_VALIDOS, type PontosObtidos }

@Schema()
export class Bet {
	@Prop({ type: MongooseSchema.Types.ObjectId, required: true, index: true })
	user!: Types.ObjectId

	@Prop({ type: MatchSchema, required: true })
	match!: Match

	@Prop({ required: false })
	homeTeamScore?: number

	@Prop({ required: false })
	awayTeamScore?: number

	@Prop({ required: false, enum: PONTOS_VALIDOS, default: 0 })
	totalPontosObitidos!: PontosObtidos

	@Prop({ required: true, default: false })
	placarCheio!: boolean

	@Prop({ required: true, default: false })
	placarTimeVencedorComGol!: boolean

	@Prop({ required: true, default: false })
	placarTimeVencedor!: boolean

	@Prop({ required: true, default: false })
	placarGol!: boolean

	@Prop({ required: false })
	classificacao?: number

	@Prop({ required: true, default: 0 })
	classificacaoAnterior!: number

	@Prop({ required: false })
	totalAcumulado?: number
}

export const BetSchema = SchemaFactory.createForClass(Bet)

// Composto: query mais quente é "todos palpites de X usuário para Y phase" (montarbets)
BetSchema.index({ user: 1, 'match.stage': 1 })

// Sort por data da partida ao listar palpites
BetSchema.index({ 'match.utcDate': 1 })
