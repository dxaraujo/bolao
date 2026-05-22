import { Controller, Get } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'

import { ApiProtectedInDocs } from '../common/swagger-auth.decorator'
import { RankingService } from './ranking.service'

@ApiTags('ranking')
@ApiProtectedInDocs()
@Controller('api/ranking')
export class RankingController {

	constructor(private readonly service: RankingService) { }

	@Get()
	async find() {
		const data = await this.service.find()
		return { data }
	}
}