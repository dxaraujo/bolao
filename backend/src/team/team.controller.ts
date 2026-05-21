import { Body, Controller, Get, Param, Put } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'

import { ApiProtectedInDocs } from 'src/common/swagger-auth.decorator'
import { UpdateTeamDto } from './dto/update-team.dto'
import { TeamService } from './team.service'

@ApiTags('team')
@Controller('api/team')
@ApiProtectedInDocs()
export class TeamController {

	constructor(private readonly service: TeamService) { }

	@Get()
	async list() {
		const data = await this.service.findAll()
		return { data }
	}

	@Put(':id')
	async update(@Param('id') id: string, @Body() body: UpdateTeamDto) {
		const data = await this.service.update(id, body)
		return { data }
	}

	@Get('import')
	async import() {
		await this.service.importTeams()
		return { data: 'Teams imported successfully' }
	}
}
