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
	placarCheio!: number

	@Prop({ required: true, default: 0 })
	placarTimeVencedorComGol!: number

	@Prop({ required: true, default: 0 })
	placarTimeVencedor!: number

	@Prop({ required: true, default: 0 })
	placarGol!: number

	@Prop({ required: true, default: 0 })
	totalAcumulado!: number

	@Prop({ required: true, default: 0 })
	classificacao!: number

	@Prop({ required: true, default: 0 })
	classificacaoAnterior!: number

	@Prop({ required: true, default: false })
	isAdmin!: boolean

	@Prop({ required: true, default: false })
	ativo!: boolean
}

export const UserSchema = SchemaFactory.createForClass(User)
