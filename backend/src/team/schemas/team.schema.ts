import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument } from 'mongoose'

export type TeamDocument = HydratedDocument<Team>

@Schema()
export class Team {

	@Prop({ required: true, unique: true })
	footballDataId!: number

	@Prop({ required: true })
	name!: string

	@Prop({ required: true })
	shortName!: string

	@Prop({ required: true })
	tla!: string

	@Prop({ required: true })
	crest!: string

	@Prop({ required: true })
	lastUpdated!: Date
}

export const TeamSchema = SchemaFactory.createForClass(Team)
