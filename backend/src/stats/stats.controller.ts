import {
	Controller,
	Get
} from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'

import { ApiProtectedInDocs } from '../common/swagger-auth.decorator'
import { StatsService } from './stats.service'
import { CurrentUser } from 'src/common/current-user.decorator'
import { JwtPayload } from 'src/auth/jwt.strategy'

@ApiTags('stats')
@ApiProtectedInDocs()
@Controller('api/stats')
export class StatsController {

	constructor(private readonly service: StatsService) { }

	@Get()
	async find() {
		const data = await this.service.find()
		return { data }
	}
}