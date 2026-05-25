import { IsOptional, IsString } from 'class-validator'

export class UpdateTeamDto {
	@IsOptional()
	@IsString()
	name?: string

	@IsOptional()
	@IsString()
	shortName?: string

	@IsOptional()
	@IsString()
	tla?: string

	@IsOptional()
	@IsString()
	flagEmoji?: string

	@IsOptional()
	@IsString()
	crest?: string
}
