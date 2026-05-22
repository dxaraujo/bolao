import { StageStatus } from '@bolao/shared'
import { Type } from 'class-transformer'
import { IsEnum, IsISO8601, IsOptional } from 'class-validator'

export class UpdateStageDto {

	@IsEnum(StageStatus)
	status!: StageStatus

	@IsOptional()
	@IsISO8601()
	@Type(() => Date)
	deadline?: Date
}
