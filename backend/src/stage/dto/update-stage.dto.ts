import { IsDateString, IsOptional } from 'class-validator'

export class UpdateStageDto {
	@IsOptional()
	@IsDateString()
	deadline?: string
}
