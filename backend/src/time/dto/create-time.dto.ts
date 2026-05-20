import { IsString } from 'class-validator'

export class CreateTimeDto {
	@IsString()
	nome!: string

	@IsString()
	sigla!: string

	@IsString()
	bandeira!: string
}
