import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument, Schema as MongooseSchema, Types } from 'mongoose'

import { Partida, PartidaSchema } from '../../partida/schemas/partida.schema'

export type PalpiteDocument = HydratedDocument<Palpite>

export const PONTOS_VALIDOS = [0, 1, 2, 3, 5] as const
export type PontosObtidos = (typeof PONTOS_VALIDOS)[number]

@Schema()
export class Palpite {
	@Prop({ type: MongooseSchema.Types.ObjectId, required: true })
	user!: Types.ObjectId

	@Prop({ type: PartidaSchema, required: true })
	partida!: Partida

	@Prop({ required: false })
	placarTimeA?: number

	@Prop({ required: false })
	placarTimeB?: number

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

export const PalpiteSchema = SchemaFactory.createForClass(Palpite)
