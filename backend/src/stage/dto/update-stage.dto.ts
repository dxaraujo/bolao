import { StageStatus } from '@bolao/shared'
import { IsEnum } from 'class-validator'

export class UpdateStageDto {

	@IsEnum(StageStatus)
	status!: StageStatus
}
