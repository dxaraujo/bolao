import { MatchStage } from '@bolao/shared'
import { IsEnum, IsOptional, IsString } from 'class-validator'
import { PhaseStatus } from '../schemas/phase.schema'

export class CreatePhaseDto {

	@IsString()
	name!: string

	@IsEnum(MatchStage)
	stage!: MatchStage

	@IsEnum(PhaseStatus)
	status!: PhaseStatus
}
