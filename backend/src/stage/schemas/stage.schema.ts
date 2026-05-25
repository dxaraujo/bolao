import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument } from 'mongoose'
import { MatchStage } from '@bolao/shared'

export type StageDocument = HydratedDocument<Stage>

@Schema({ timestamps: true })
export class Stage {
	@Prop({ required: true, unique: true, enum: Object.values(MatchStage), index: true })
	code!: MatchStage

	@Prop({ required: true, unique: true, min: 1, max: 7, index: true })
	order!: number

	@Prop({ required: true })
	deadline!: Date

	@Prop({ required: true })
	expectedMatchCount!: number
}

export const StageSchema = SchemaFactory.createForClass(Stage)
StageSchema.index({ code: 1 }, { unique: true })
StageSchema.index({ order: 1 }, { unique: true })
