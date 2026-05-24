import { Controller, Get } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'

import { ApiProtectedInDocs } from '../common/swagger-auth.decorator'
import { SystemStateService } from './system-state.service'

@ApiTags('system')
@Controller('api/system')
@ApiProtectedInDocs()
export class SystemStateController {
	constructor(private readonly service: SystemStateService) {}

	@Get('state')
	async getState() {
		const data = await this.service.getPayload()
		return { data }
	}
}
