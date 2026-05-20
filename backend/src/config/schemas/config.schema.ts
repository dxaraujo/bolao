import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument } from 'mongoose'

export type ConfigDocument = HydratedDocument<Config>

@Schema({ collection: 'configs' })
export class Config {
	@Prop({ required: true })
	atualizandoPontuacoes!: boolean
}

export const ConfigSchema = SchemaFactory.createForClass(Config)
