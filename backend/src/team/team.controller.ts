import { Controller, Get, Post, UseGuards } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'

import { AdminGuard } from '../common/admin.guard'
import { ApiProtectedInDocs } from '../common/swagger-auth.decorator'
import { TeamService } from './team.service'

@ApiTags('team')
@Controller('api/team')
@ApiProtectedInDocs()
export class TeamController {
	constructor(private readonly service: TeamService) {}

	@Get()
	async list() {
		const data = await this.service.findAll()
		return { data }
	}

	@Post('import')
	@UseGuards(AdminGuard)
	async import() {
		await this.service.importTeams()
		return { data: 'Teams imported successfully' }
	}
}
