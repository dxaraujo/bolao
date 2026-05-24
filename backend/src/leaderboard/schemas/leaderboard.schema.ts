import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument, Schema as MongooseSchema, Types } from 'mongoose'

import { User } from '../../user/schemas/user.schema'

export type LeaderboardDocument = HydratedDocument<Leaderboard>

@Schema({ _id: false })
export class LeaderboardBreakdownSub {
	@Prop({ required: true, default: 0 })
	exactScore!: number

	@Prop({ required: true, default: 0 })
	winnerWithGoal!: number

	@Prop({ required: true, default: 0 })
	correctWinner!: number

	@Prop({ required: true, default: 0 })
	oneGoalCorrect!: number

	@Prop({ required: true, default: 0 })
	wrong!: number
}
const LeaderboardBreakdownSchema = SchemaFactory.createForClass(LeaderboardBreakdownSub)

@Schema({ _id: false })
export class LeaderboardRowSub {
	@Prop({ type: MongooseSchema.Types.ObjectId, ref: User.name, required: true })
	user!: Types.ObjectId

	@Prop({ required: true })
	points!: number

	@Prop({ type: LeaderboardBreakdownSchema, required: true })
	breakdown!: LeaderboardBreakdownSub

	@Prop({ required: true })
	rank!: number
}
const LeaderboardRowSchema = SchemaFactory.createForClass(LeaderboardRowSub)

@Schema({ timestamps: true })
export class Leaderboard {
	@Prop({ required: true, unique: true })
	key!: string  // sempre 'singleton'

	@Prop({ required: true })
	generatedAt!: Date

	@Prop({ type: [LeaderboardRowSchema], default: [] })
	rows!: LeaderboardRowSub[]
}

export const LeaderboardSchema = SchemaFactory.createForClass(Leaderboard)
LeaderboardSchema.index({ key: 1 }, { unique: true })
