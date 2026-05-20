import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument } from 'mongoose'

export type ConfigDocument = HydratedDocument<Config>

@Schema({ collection: 'config' })
export class Config {

	@Prop({ required: true })
	updatingScores!: boolean
}

export const ConfigSchema = SchemaFactory.createForClass(Config)
