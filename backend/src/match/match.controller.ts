import { Controller, Get, UseGuards } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'

import { AdminGuard } from 'src/common/admin.guard'
import { ApiProtectedInDocs } from 'src/common/swagger-auth.decorator'
import { MatchService } from './match.service'

@ApiTags('match')
@Controller('api/match')
@ApiProtectedInDocs()
export class MatchController {

	constructor(private readonly service: MatchService) { }

	@Get('visible')
	async findVisible() {
		const data = await this.service.findVisible()
		return { data }
	}

	@Get()
	@UseGuards(AdminGuard)
	async findAll() {
		const data = await this.service.findAll()
		return { data }
	}

	@Get('import')
	@UseGuards(AdminGuard)
	async import() {
		await this.service.importMatches()
		return { data: 'Matches imported successfully' }
	}
}
