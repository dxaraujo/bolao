import { PhaseStatus } from '@bolao/shared'
import { IsEnum, IsOptional } from 'class-validator'

export class UpdatePhaseDto {

    @IsEnum(PhaseStatus)
    status!: PhaseStatus
}