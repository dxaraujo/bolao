import { IsInt, IsOptional, Min } from 'class-validator'

export class UpdateResultadoDto {
	@IsOptional()
	@IsInt()
	@Min(0)
	placarTimeA?: number

	@IsOptional()
	@IsInt()
	@Min(0)
	placarTimeB?: number
}
