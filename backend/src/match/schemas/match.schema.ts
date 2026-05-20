import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument } from 'mongoose'

import { Team, TeamSchema } from '../../team/schemas/team.schema'

export type MatchDocument = HydratedDocument<Match>

@Schema()
export class Match {

	@Prop({ required: true, unique: true })
	id!: number

	@Prop({ required: true, index: true })
	utcDate!: Date

	@Prop({ required: true })
	status!: string

	@Prop({ required: true })
	matchday!: number

	@Prop({ required: true, index: true })
	stage!: string

	@Prop({ required: true })
	group!: string

	@Prop({ type: TeamSchema, required: false })
	homeTeam?: Team

	@Prop({ type: TeamSchema, required: false })
	awayTeam?: Team

	@Prop({ required: false })
	homeTeamScore?: number

	@Prop({ required: false })
	awayTeamScore?: number

	@Prop({ required: true })
	lastUpdated!: Date
}

export const MatchSchema = SchemaFactory.createForClass(Match)
