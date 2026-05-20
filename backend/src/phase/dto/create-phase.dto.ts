import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator'
import { PhaseStatus } from '../schemas/phase.schema'

export class CreatePhaseDto {

	@IsInt()
	@Min(0)
	id!: number

	@IsString()
	name!: string

	@IsOptional()
	@IsEnum(PhaseStatus)
	status!: PhaseStatus
}
