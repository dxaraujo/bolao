import { IsInt, IsOptional, Min } from 'class-validator'

export class UpdateScoreDto {

	@IsOptional()
	@IsInt()
	@Min(0)
	homeTeamScore?: number

	@IsOptional()
	@IsInt()
	@Min(0)
	awayTeamScore?: number
}
