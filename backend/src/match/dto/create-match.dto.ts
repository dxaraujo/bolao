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
import { MatchStage, MatchStatus } from '../schemas/match.schema'

export class CreateMatchDto {

	@IsInt()
	@Min(0)
	footballDataId!: number

	@Type(() => Date)
	@IsDate()
	utcDate!: Date

	@IsEnum(MatchStatus)
	status!: MatchStatus

	@IsInt()
	@Min(0)
	matchday!: number

	@IsEnum(MatchStage)
	stage!: MatchStage

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
