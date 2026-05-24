import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument, Schema as MongooseSchema, Types } from 'mongoose'

import { Match } from '../../match/schemas/match.schema'
import { User } from '../../user/schemas/user.schema'

export type BetDocument = HydratedDocument<Bet>

@Schema({ _id: false })
export class BetScoreSub {
	@Prop({ required: true, min: 0 })
	home!: number

	@Prop({ required: true, min: 0 })
	away!: number
}
const BetScoreSchema = SchemaFactory.createForClass(BetScoreSub)

@Schema({ timestamps: true })
export class Bet {

	@Prop({ type: MongooseSchema.Types.ObjectId, ref: User.name, required: true, index: true })
	user!: Types.ObjectId

	@Prop({ type: MongooseSchema.Types.ObjectId, ref: Match.name, required: true, index: true })
	match!: Types.ObjectId

	@Prop({ type: BetScoreSchema, required: true })
	score!: BetScoreSub
}

export const BetSchema = SchemaFactory.createForClass(Bet)
BetSchema.index({ user: 1, match: 1 }, { unique: true })
BetSchema.index({ match: 1 })
