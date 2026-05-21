import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument } from 'mongoose'
import { MatchStage, StageStatus } from '@bolao/shared'

export type StageDocument = HydratedDocument<Stage>
export { StageStatus }

@Schema()
export class Stage {

	@Prop({
		required: true,
		unique: true,
		enum: Object.values(MatchStage),
		default: MatchStage.GROUP_STAGE,
		index: true,
	})
	matchStage!: MatchStage

	@Prop({
		required: true,
		enum: Object.values(StageStatus),
		default: StageStatus.DISABLED,
		index: true,
	})
	status!: StageStatus
}

export const StageSchema = SchemaFactory.createForClass(Stage)
