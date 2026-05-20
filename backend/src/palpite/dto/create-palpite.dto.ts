import { Type } from 'class-transformer'
import { IsInt, IsMongoId, IsObject, IsOptional, Min, ValidateNested } from 'class-validator'

import { CreatePartidaDto } from '../../partida/dto/create-partida.dto'

export class CreatePalpiteDto {
	@IsMongoId()
	user!: string

	@IsObject()
	@ValidateNested()
	@Type(() => CreatePartidaDto)
	partida!: CreatePartidaDto

	@IsOptional()
	@IsInt()
	@Min(0)
	placarTimeA?: number

	@IsOptional()
	@IsInt()
	@Min(0)
	placarTimeB?: number
}
