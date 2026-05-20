import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument } from 'mongoose'

export type TimeDocument = HydratedDocument<Time>

@Schema()
export class Time {
	@Prop({ required: true })
	nome!: string

	@Prop({ required: true })
	sigla!: string

	@Prop({ required: true })
	bandeira!: string
}

export const TimeSchema = SchemaFactory.createForClass(Time)
