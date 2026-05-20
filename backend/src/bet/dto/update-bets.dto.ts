import { IsInt, IsMongoId, IsOptional, Min } from 'class-validator'

export class BetUpdateItemDto {

	@IsMongoId()
	_id!: string

	@IsOptional()
	@IsInt()
	@Min(0)
	homeTeamScore?: number

	@IsOptional()
	@IsInt()
	@Min(0)
	awayTeamScore?: number
}
