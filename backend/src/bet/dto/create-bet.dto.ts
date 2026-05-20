import { Type } from 'class-transformer'
import { IsInt, IsMongoId, IsObject, IsOptional, Min, ValidateNested } from 'class-validator'

import { CreateMatchDto } from '../../match/dto/create-match.dto'

export class CreateBetDto {
	@IsMongoId()
	user!: string

	@IsObject()
	@ValidateNested()
	@Type(() => CreateMatchDto)
	match!: CreateMatchDto

	@IsOptional()
	@IsInt()
	@Min(0)
	homeTeamScore?: number

	@IsOptional()
	@IsInt()
	@Min(0)
	awayTeamScore?: number
}
