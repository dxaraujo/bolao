import { IsBoolean, IsOptional } from 'class-validator'

export class UpdateUserDto {
	@IsOptional()
	@IsBoolean()
	isAdmin?: boolean

	@IsOptional()
	@IsBoolean()
	ativo?: boolean
}
