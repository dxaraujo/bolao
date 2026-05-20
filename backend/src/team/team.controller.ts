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

import { CreateTeamDto } from './dto/create-team.dto'
import { UpdateTeamDto } from './dto/update-team.dto'
import { TeamService } from './team.service'

@ApiTags('team')
@ApiBearerAuth('access-token')
@Controller('api/team')
export class TeamController {
	constructor(private readonly service: TeamService) {}

	@Get()
	async list(@Query() query: Record<string, unknown>) {
		const data = await this.service.findAll(query)
		return { data }
	}

	@Get(':id')
	async getById(@Param('id') id: string) {
		const data = await this.service.findById(id)
		return { data }
	}

	@Post()
	@HttpCode(HttpStatus.CREATED)
	async create(@Body() body: CreateTeamDto) {
		const data = await this.service.create(body)
		return { data }
	}

	@Put(':id')
	async update(@Param('id') id: string, @Body() body: UpdateTeamDto) {
		const data = await this.service.update(id, body)
		return { data }
	}

	@Delete(':id')
	async remove(@Param('id') id: string) {
		const data = await this.service.remove(id)
		return { data }
	}
}
