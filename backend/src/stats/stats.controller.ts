import { Controller, Get } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'

import { ApiProtectedInDocs } from '../common/swagger-auth.decorator'
import { StatsService } from './stats.service'

@ApiTags('stats')
@ApiProtectedInDocs()
@Controller('api/stats')
export class StatsController {

	constructor(private readonly service: StatsService) { }

	@Get('overview')
	async overview() {
		const data = await this.service.overview()
		return { data }
	}

	@Get('accuracy-by-user')
	async accuracyByUser() {
		const data = await this.service.accuracyByUser()
		return { data }
	}

	@Get('distribution')
	async distribution() {
		const data = await this.service.distribution()
		return { data }
	}
}
