import { Type } from 'class-transformer'
import { ArrayMaxSize, ArrayMinSize, IsArray, IsInt, IsMongoId, IsOptional, Max, Min, ValidateNested } from 'class-validator'
import { MAX_GOALS } from '@bolao/shared'

export class BetSubmitScoreDto {
	@IsInt()
	@Min(0)
	@Max(MAX_GOALS)
	home!: number

	@IsInt()
	@Min(0)
	@Max(MAX_GOALS)
	away!: number
}

export class BetSubmitItemDto {
	@IsMongoId()
	matchId!: string

	@IsOptional()
	@ValidateNested()
	@Type(() => BetSubmitScoreDto)
	score?: BetSubmitScoreDto | null
}

export class BetSubmitDto {
	@IsArray()
	@ArrayMinSize(1)
	@ArrayMaxSize(200)
	@ValidateNested({ each: true })
	@Type(() => BetSubmitItemDto)
	items!: BetSubmitItemDto[]
}
