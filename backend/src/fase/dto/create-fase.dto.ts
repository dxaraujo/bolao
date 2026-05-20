import { IsEnum, IsOptional, IsString } from 'class-validator'
import { FaseStatus } from '../schemas/fase.schema'

export class CreateFaseDto {
	@IsString()
	nome!: string

	@IsOptional()
	@IsEnum(FaseStatus)
	status?: FaseStatus
}
