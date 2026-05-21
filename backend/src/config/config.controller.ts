import { Controller, Get } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'

import { ApiProtectedInDocs } from '../common/swagger-auth.decorator'
import { AppConfigService } from './config.service'

@ApiTags('config')
@ApiProtectedInDocs()
@Controller('api/config')
export class AppConfigController {
	constructor(private readonly service: AppConfigService) {}

	@Get()
	async getOne() {
		const data = await this.service.findOne()
		return { data }
	}
}
