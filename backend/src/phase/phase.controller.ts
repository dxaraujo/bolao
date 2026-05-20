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

import { CreatePhaseDto } from './dto/create-phase.dto'
import { UpdatePhaseDto } from './dto/update-phase.dto'
import { PhaseService } from './phase.service'

@ApiTags('phase')
@ApiBearerAuth('access-token')
@Controller('api/phase')
export class PhaseController {
	constructor(private readonly service: PhaseService) {}

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
	async create(@Body() body: CreatePhaseDto) {
		const data = await this.service.create(body)
		return { data }
	}

	@Put(':id')
	async update(@Param('id') id: string, @Body() body: UpdatePhaseDto) {
		const data = await this.service.update(id, body)
		return { data }
	}

	@Delete(':id')
	async remove(@Param('id') id: string) {
		const data = await this.service.remove(id)
		return { data }
	}
}
