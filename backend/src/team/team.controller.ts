import { Body, Controller, Get, Param, Put, UseGuards } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'

import { AdminGuard } from 'src/common/admin.guard'
import { ApiProtectedInDocs } from 'src/common/swagger-auth.decorator'
import { UpdateTeamDto } from './dto/update-team.dto'
import { TeamService } from './team.service'

@ApiTags('team')
@Controller('api/team')
@ApiProtectedInDocs()
export class TeamController {

	constructor(private readonly service: TeamService) { }

	@Get()
	async findAll() {
		const data = await this.service.findAll()
		return { data }
	}

	@Put(':id')
	@UseGuards(AdminGuard)
	async update(@Param('id') id: string, @Body() body: UpdateTeamDto) {
		const data = await this.service.update(id, body)
		return { data }
	}

	@Get('import')
	@UseGuards(AdminGuard)
	async import() {
		await this.service.importTeams()
		return { data: 'Teams imported successfully' }
	}
}
