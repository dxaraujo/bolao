import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument } from 'mongoose'

export type UserDocument = HydratedDocument<User>

@Schema({ strict: false })
export class User {

	@Prop({ required: true, unique: true, index: true })
	googleSub!: string

	@Prop({ required: true })
	name!: string

	@Prop({ required: true })
	email!: string

	@Prop({ default: '' })
	picture!: string

	@Prop({ required: true, default: 0 })
	exactScore!: number

	@Prop({ required: true, default: 0 })
	winnerWithGoal!: number

	@Prop({ required: true, default: 0 })
	correctWinner!: number

	@Prop({ required: true, default: 0 })
	oneGoalCorrect!: number

	@Prop({ required: true, default: 0 })
	cumulativeTotal!: number

	@Prop({ required: true, default: 0 })
	ranking?: number

	@Prop({ required: true, default: 0 })
	previousRanking!: number

	@Prop({ required: true, default: false })
	isAdmin!: boolean

	@Prop({ required: true, default: false })
	isActive!: boolean
}

export const UserSchema = SchemaFactory.createForClass(User)
