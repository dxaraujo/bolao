import { IsInt, IsMongoId, IsOptional, Min } from 'class-validator'

export class PalpiteUpdateItemDto {
	@IsMongoId()
	_id!: string

	@IsOptional()
	@IsInt()
	@Min(0)
	placarTimeA?: number

	@IsOptional()
	@IsInt()
	@Min(0)
	placarTimeB?: number
}
