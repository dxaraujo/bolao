import { Controller, Get } from '@nestjs/common'
import { AppConfigService } from './config.service'

@Controller('api/config')
export class AppConfigController {
	constructor(private readonly service: AppConfigService) {}

	@Get()
	async list() {
		const data = await this.service.findAll()
		return { data }
	}
}
