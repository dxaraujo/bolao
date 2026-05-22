import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument, Schema as MongooseSchema, Types } from 'mongoose'
import { VALID_POINTS, type PointsEarned } from '@bolao/shared'

import { Match, MatchDocument } from '../../match/schemas/match.schema'
import { User } from '../../user/schemas/user.schema'

export type BetDocument = HydratedDocument<Bet>
export type BetPopulated = Omit<BetDocument, 'match'> & { match: MatchDocument }
export { VALID_POINTS, type PointsEarned }

@Schema()
export class Bet {

	@Prop({ type: MongooseSchema.Types.ObjectId, ref: User.name, required: true, index: true })
	user!: Types.ObjectId

	@Prop({ type: MongooseSchema.Types.ObjectId, ref: Match.name, required: true, index: true })
	match!: Types.ObjectId

	@Prop({ required: false })
	homeTeamScore?: number

	@Prop({ required: false })
	awayTeamScore?: number

	@Prop({ required: false, enum: VALID_POINTS, default: 0 })
	totalPointsEarned!: PointsEarned

	@Prop({ required: true, default: false })
	exactScore!: boolean

	@Prop({ required: true, default: false })
	winnerWithGoal!: boolean

	@Prop({ required: true, default: false })
	correctWinner!: boolean

	@Prop({ required: true, default: false })
	oneGoalCorrect!: boolean

	@Prop({ required: true, default: 0 })
	ranking?: number

	@Prop({ required: true, default: 0 })
	previousRanking!: number

	@Prop({ required: true, default: 0 })
	cumulativeTotal?: number
}

export const BetSchema = SchemaFactory.createForClass(Bet)

BetSchema.index({ user: 1, match: 1 })
