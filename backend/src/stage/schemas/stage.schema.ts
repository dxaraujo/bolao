import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument } from 'mongoose'
import { MatchStage, StageStatus } from '@bolao/shared'

export type StageDocument = HydratedDocument<Stage>
export { StageStatus }

@Schema()
export class Stage {

	@Prop({ required: true, unique: true, enum: Object.values(MatchStage), index: true })
	matchStage!: MatchStage

	@Prop({ required: true, enum: Object.values(StageStatus), index: true })
	status!: StageStatus

	@Prop({ required: false })
	deadline?: Date
}

export const StageSchema = SchemaFactory.createForClass(Stage)

StageSchema.index({ matchStage: 1 }, { unique: true })
