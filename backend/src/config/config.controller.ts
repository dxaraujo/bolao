import { Controller, Get } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'

import { Public } from 'src/common/public.decorator'
import { AppConfigService } from './config.service'

@ApiTags('config')
@Controller('api/config')
export class AppConfigController {
	constructor(private readonly service: AppConfigService) { }

	@Get()
	@Public()
	async getOne() {
		const data = await this.service.findOne()
		return { data }
	}
}
