import { IsDate, IsInt, IsString, Min } from 'class-validator'

export class CreateTeamDto {

	@IsInt()
	@Min(0)
	id!: number

	@IsString()
	name!: string

	@IsString()
	shortName!: string

	@IsString()
	tla!: string

	@IsString()
	crest!: string

	@IsDate()
	lastUpdated!: Date
}
