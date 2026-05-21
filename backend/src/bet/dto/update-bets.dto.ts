import { IsInt, IsMongoId, IsOptional, Max, Min } from 'class-validator'

export class BetUpdateItemDto {

	@IsMongoId()
	_id!: string

	@IsOptional()
	@IsInt()
	@Min(0)
	@Max(99)
	homeTeamScore?: number

	@IsOptional()
	@IsInt()
	@Min(0)
	@Max(99)
	awayTeamScore?: number
}
