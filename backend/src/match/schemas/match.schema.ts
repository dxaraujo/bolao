import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument } from 'mongoose'
import { MatchStage, MatchStatus } from '@bolao/shared'

import { Team, TeamSchema } from '../../team/schemas/team.schema'

export type MatchDocument = HydratedDocument<Match>
export { MatchStage, MatchStatus }

@Schema()
export class Match {

	@Prop({ required: true, unique: true })
	id!: number

	@Prop({ required: true, index: true })
	utcDate!: Date

	@Prop({ required: true, enum: Object.values(MatchStatus) })
	status!: MatchStatus

	@Prop({ required: true })
	matchday!: number

	@Prop({ required: true, enum: Object.values(MatchStage), index: true })
	stage!: MatchStage

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
