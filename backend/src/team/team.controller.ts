import { Controller, Get, UseGuards } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'

import { AdminGuard } from 'src/common/admin.guard'
import { ApiProtectedInDocs } from 'src/common/swagger-auth.decorator'
import { TeamService } from './team.service'

@ApiTags('team')
@Controller('api/team')
@ApiProtectedInDocs()
export class TeamController {

	constructor(private readonly service: TeamService) { }

	@Get('import')
	@UseGuards(AdminGuard)
	async import() {
		await this.service.importTeams()
		return { data: 'Teams imported successfully' }
	}
}
