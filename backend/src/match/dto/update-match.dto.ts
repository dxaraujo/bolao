import { MatchStatus } from '@bolao/shared'
import { IsEnum, IsInt, Max, Min } from 'class-validator'

export class UpdateMatchDto {

    @IsEnum(MatchStatus)
	status!: MatchStatus

	@IsInt()
	@Min(0)
	@Max(99)
	homeTeamScore?: number

	@IsInt()
	@Min(0)
	@Max(99)
	awayTeamScore?: number
}