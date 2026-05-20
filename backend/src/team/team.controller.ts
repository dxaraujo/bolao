import {
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	HttpStatus,
	Param,
	Post,
	Put,
	Query,
} from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'

import { Public } from 'src/common/public.decorator'
import { CreateTeamDto } from './dto/create-team.dto'
import { UpdateTeamDto } from './dto/update-team.dto'
import { TeamImportService } from './team-import.service'
import { TeamService } from './team.service'

@ApiTags('team')
@Controller('api/team')
export class TeamController {

	constructor(private readonly service: TeamService, private readonly teamImportService: TeamImportService) { }

	@Public()
	@Get('import')
	async import() {
		await this.teamImportService.importTeams()
		return { data: 'Teams imported successfully' }
	}

	@Get()
	@ApiBearerAuth('access-token')
	async list(@Query() query: Record<string, unknown>) {
		const data = await this.service.findAll(query)
		return { data }
	}

	@Get(':id')
	@ApiBearerAuth('access-token')
	async getById(@Param('id') id: string) {
		const data = await this.service.findById(id)
		return { data }
	}

	@Post()
	@HttpCode(HttpStatus.CREATED)
	@ApiBearerAuth('access-token')
	async create(@Body() body: CreateTeamDto) {
		const data = await this.service.create(body)
		return { data }
	}

	@Put(':id')
	@ApiBearerAuth('access-token')
	async update(@Param('id') id: string, @Body() body: UpdateTeamDto) {
		const data = await this.service.update(id, body)
		return { data }
	}

	@Delete(':id')
	@ApiBearerAuth('access-token')
	async remove(@Param('id') id: string) {
		const data = await this.service.remove(id)
		return { data }
	}
}
