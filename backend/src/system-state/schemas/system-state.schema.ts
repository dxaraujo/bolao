import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument } from 'mongoose'

export type SystemStateDocument = HydratedDocument<SystemState>

@Schema({ timestamps: true })
export class SystemState {
	@Prop({ required: true, unique: true })
	key!: string // sempre 'singleton'

	@Prop({ type: Date, default: null })
	scoreSyncStartedAt!: Date | null

	@Prop({ type: Date, default: null })
	scoreSyncCompletedAt!: Date | null

	@Prop({ type: Date, default: null })
	leaderboardRebuildAt!: Date | null

	@Prop({ type: Date, default: null })
	lastMatchImportAt!: Date | null
}

export const SystemStateSchema = SchemaFactory.createForClass(SystemState)
SystemStateSchema.index({ key: 1 }, { unique: true })
