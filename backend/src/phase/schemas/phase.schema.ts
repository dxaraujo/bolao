import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument } from 'mongoose'
import { MatchStage, PhaseStatus } from '@bolao/shared'

export type PhaseDocument = HydratedDocument<Phase>
export { PhaseStatus }

@Schema()
export class Phase {

	@Prop({ required: true, unique: true })
	name!: string

	@Prop({
		required: true,
		unique: true,
		enum: Object.values(MatchStage),
		default: MatchStage.GROUP_STAGE,
		index: true,
	})
	stage!: MatchStage

	@Prop({
		required: true,
		enum: Object.values(PhaseStatus),
		default: PhaseStatus.DISABLED,
		index: true,
	})
	status!: PhaseStatus
}

export const PhaseSchema = SchemaFactory.createForClass(Phase)
