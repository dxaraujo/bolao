import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument, Schema as MongooseSchema, Types } from 'mongoose'
import { MatchStage, MatchStatus } from '@bolao/shared'

import { Team, TeamDocument, TeamSchema } from '../../team/schemas/team.schema'

export type MatchDocument = HydratedDocument<Match>

export { MatchStage, MatchStatus }

@Schema()
export class Match {

	@Prop({ required: true, unique: true })
	footballDataId!: number

	@Prop({ required: true, index: true })
	utcDate!: Date

	@Prop({ required: true, enum: Object.values(MatchStatus) })
	status!: MatchStatus

	@Prop({ required: true, enum: Object.values(MatchStage), index: true })
	stage!: MatchStage

	@Prop({ required: false })
	group?: string

	@Prop({ type: MongooseSchema.Types.ObjectId, ref: Team.name, required: false, default: null, index: true })
	homeTeam?: Types.ObjectId | null

	@Prop({ type: MongooseSchema.Types.ObjectId, ref: Team.name, required: false, default: null, index: true })
	awayTeam?: Types.ObjectId | null

	@Prop({ required: false })
	homeTeamScore?: number

	@Prop({ required: false })
	awayTeamScore?: number

	@Prop({ required: true, default: true, index: true })
	valid!: boolean

	@Prop({ required: true })
	lastUpdated!: Date
}

export const MatchSchema = SchemaFactory.createForClass(Match)

MatchSchema.index({ footballDataId: 1 }, { unique: true })
MatchSchema.index({ utcDate: 1 })
MatchSchema.index({ stage: 1 })
