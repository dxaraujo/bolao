import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument } from 'mongoose'

export type ConfigDocument = HydratedDocument<Config>

@Schema({ collection: 'config' })
export class Config {

	@Prop({ required: true, default: false })
	updatingScores!: boolean

	@Prop({ required: true, default: 5 })
	pointsExactScore!: number

	@Prop({ required: true, default: 3 })
	pointsWinnerWithGoal!: number

	@Prop({ required: true, default: 2 })
	pointsOneGoalCorrect!: number

	@Prop({ required: true, default: 1 })
	pointsCorrectWinner!: number
}

export const ConfigSchema = SchemaFactory.createForClass(Config)
