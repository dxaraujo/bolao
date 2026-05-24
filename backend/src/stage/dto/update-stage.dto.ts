import { IsDateString, IsInt, IsOptional, Min } from 'class-validator'

export class UpdateStageDto {

	@IsOptional()
	@IsDateString()
	deadline?: string

	@IsOptional()
	@IsInt()
	@Min(1)
	expectedMatchCount?: number
}
