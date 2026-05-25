import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument } from 'mongoose'

export type TeamDocument = HydratedDocument<Team>

@Schema({ timestamps: true })
export class Team {
	@Prop({ required: true, unique: true })
	footballDataId!: number

	@Prop({ required: true })
	name!: string

	@Prop({ required: true })
	shortName!: string

	@Prop({ required: true })
	tla!: string

	/** Emoji de bandeira nacional (preferencial). */
	@Prop({ required: false })
	flagEmoji?: string

	/** URL local do escudo (fallback quando não houver bandeira). */
	@Prop({ required: false })
	crest?: string

	@Prop({ required: true })
	externalLastUpdated!: Date
}

export const TeamSchema = SchemaFactory.createForClass(Team)
TeamSchema.index({ footballDataId: 1 }, { unique: true })
