import { Type } from 'class-transformer'
import {
	IsDate,
	IsEnum,
	IsInt,
	IsObject,
	IsOptional,
	Min,
	ValidateNested,
} from 'class-validator'
import { FaseNome, Grupo, Rodada } from '../schemas/partida.schema'
import { CreateTimeDto } from '../../time/dto/create-time.dto'

export class CreatePartidaDto {
	@IsOptional()
	@IsInt()
	@Min(0)
	order?: number

	@IsEnum(FaseNome)
	fase!: FaseNome

	@IsOptional()
	@IsEnum(Grupo)
	grupo?: Grupo

	@IsOptional()
	@IsEnum(Rodada)
	rodada?: Rodada

	@Type(() => Date)
	@IsDate()
	data!: Date

	@IsOptional()
	@IsObject()
	@ValidateNested()
	@Type(() => CreateTimeDto)
	timeA?: CreateTimeDto

	@IsOptional()
	@IsInt()
	@Min(0)
	placarTimeA?: number

	@IsOptional()
	@IsObject()
	@ValidateNested()
	@Type(() => CreateTimeDto)
	timeB?: CreateTimeDto

	@IsOptional()
	@IsInt()
	@Min(0)
	placarTimeB?: number
}
