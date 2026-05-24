import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument } from 'mongoose'

export type UserDocument = HydratedDocument<User>

@Schema({ timestamps: true })
export class User {
	@Prop({ required: true, unique: true, index: true })
	googleSub!: string

	@Prop({ required: true })
	name!: string

	@Prop({ required: true })
	email!: string

	@Prop({ required: false })
	picture!: string

	@Prop({ required: false })
	avatar?: string

	@Prop({ required: true, default: false })
	isAdmin!: boolean

	@Prop({ required: true, default: false })
	isActive!: boolean

	@Prop({ required: false })
	participationChangedAt?: Date
}

export const UserSchema = SchemaFactory.createForClass(User)
