import { Controller, Get } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'

import { AppConfigService } from './config.service'

@ApiTags('config')
@ApiBearerAuth('access-token')
@Controller('api/config')
export class AppConfigController {
	constructor(private readonly service: AppConfigService) {}

	@Get()
	async getOne() {
		const data = await this.service.findOne()
		return { data }
	}
}
