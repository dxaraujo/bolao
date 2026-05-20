import { Type } from 'class-transformer'
import {
	IsDate,
	IsEnum,
	IsInt,
	IsObject,
	IsOptional,
	IsString,
	Min,
	ValidateNested,
} from 'class-validator'
import { CreateTeamDto } from '../../team/dto/create-team.dto'

export class CreateMatchDto {

	@IsInt()
	@Min(0)
	id!: number

	@Type(() => Date)
	@IsDate()
	utcDate!: Date

	@IsString()
	status!: string

	@IsInt()
	@Min(0)
	matchday!: number

	@IsString()
	stage!: string

	@IsString()
	group!: string

	@IsObject()
	@ValidateNested()
	@Type(() => CreateTeamDto)
	homeTeam?: CreateTeamDto

	@IsObject()
	@ValidateNested()
	@Type(() => CreateTeamDto)
	awayTeam?: CreateTeamDto

	@IsOptional()
	@IsInt()
	@Min(0)
	homeTeamScore?: number

	@IsOptional()
	@IsInt()
	@Min(0)
	awayTeamScore?: number

	@IsDate()
	lastUpdated!: Date
}
