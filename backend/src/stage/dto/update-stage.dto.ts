import { StageStatus } from '@bolao/shared'
import { IsEnum, IsISO8601, IsOptional } from 'class-validator'

export class UpdateStageDto {

	@IsEnum(StageStatus)
	status!: StageStatus

	@IsOptional()
	@IsISO8601()
	deadline?: string
}
