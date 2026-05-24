import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument, Schema as MongooseSchema, Types } from 'mongoose'
import { MatchStatus } from '@bolao/shared'

import { Stage } from '../../stage/schemas/stage.schema'
import { Team } from '../../team/schemas/team.schema'

export type MatchDocument = HydratedDocument<Match>

@Schema({ _id: false })
export class MatchScore {
	@Prop({ required: true, min: 0 })
	home!: number

	@Prop({ required: true, min: 0 })
	away!: number
}
const MatchScoreSchema = SchemaFactory.createForClass(MatchScore)

@Schema({ timestamps: true })
export class Match {
	@Prop({ required: true, unique: true })
	footballDataId!: number

	@Prop({ required: true, index: true })
	utcDate!: Date

	@Prop({ required: true, enum: Object.values(MatchStatus), index: true })
	status!: MatchStatus

	@Prop({ type: MongooseSchema.Types.ObjectId, ref: Stage.name, required: true, index: true })
	stage!: Types.ObjectId

	@Prop({ required: false })
	group?: string

	@Prop({ type: MongooseSchema.Types.ObjectId, ref: Team.name, required: true, index: true })
	homeTeam!: Types.ObjectId

	@Prop({ type: MongooseSchema.Types.ObjectId, ref: Team.name, required: true, index: true })
	awayTeam!: Types.ObjectId

	@Prop({ type: MatchScoreSchema, required: false })
	score?: MatchScore

	@Prop({ required: true })
	externalLastUpdated!: Date
}

export const MatchSchema = SchemaFactory.createForClass(Match)
MatchSchema.index({ footballDataId: 1 }, { unique: true })
MatchSchema.index({ stage: 1, utcDate: 1 })
