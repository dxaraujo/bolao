import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument } from 'mongoose'

import { Time, TimeSchema } from '../../time/schemas/time.schema'

export type PartidaDocument = HydratedDocument<Partida>

export enum FaseNome {
	GRUPOS = 'FASE DE GRUPOS',
	OITAVAS = 'OITAVAS DE FINAL',
	QUARTAS = 'QUARTAS DE FINAL',
	SEMIFINAL = 'SEMIFINAL',
	DISPUTA_TERCEIRO = 'DISPUTA DO 3º LUGAR',
	FINAL = 'FINAL',
}

export enum Grupo {
	A = 'GRUPO A',
	B = 'GRUPO B',
	C = 'GRUPO C',
	D = 'GRUPO D',
	E = 'GRUPO E',
	F = 'GRUPO F',
	G = 'GRUPO G',
	H = 'GRUPO H',
	SEM_GRUPO = 'SEM GRUPO',
}

export enum Rodada {
	PRIMEIRA = '1ª RODADA',
	SEGUNDA = '2ª RODADA',
	TERCEIRA = '3ª RODADA',
	SEM_RODADA = 'SEM RODADA',
}

@Schema()
export class Partida {
	@Prop({ required: true, default: 0 })
	order!: number

	@Prop({ required: true, enum: Object.values(FaseNome) })
	fase!: FaseNome

	@Prop({ required: false, enum: Object.values(Grupo) })
	grupo?: Grupo

	@Prop({ required: false, enum: Object.values(Rodada) })
	rodada?: Rodada

	@Prop({ required: true })
	data!: Date

	@Prop({ type: TimeSchema, required: false })
	timeA?: Time

	@Prop({ required: false })
	placarTimeA?: number

	@Prop({ type: TimeSchema, required: false })
	timeB?: Time

	@Prop({ required: false })
	placarTimeB?: number
}

export const PartidaSchema = SchemaFactory.createForClass(Partida)
