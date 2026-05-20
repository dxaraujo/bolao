import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument } from 'mongoose'

export type FaseDocument = HydratedDocument<Fase>

export enum FaseStatus {
	DESABILITADO = 'D',
	ABERTO = 'A',
	BLOQUEADO = 'B',
}

// D: DESABILITADO, A: ABERTO PARA PREENCHIMENTO DE PALPITES, B: BLOQUEADO PARA ALTERAÇÃO DOS PALPITES
@Schema()
export class Fase {
	@Prop({ required: true })
	nome!: string

	@Prop({
		required: true,
		enum: Object.values(FaseStatus),
		default: FaseStatus.DESABILITADO,
	})
	status!: FaseStatus
}

export const FaseSchema = SchemaFactory.createForClass(Fase)
