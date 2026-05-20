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

import { CreateTimeDto } from './dto/create-time.dto'
import { UpdateTimeDto } from './dto/update-time.dto'
import { TimeService } from './time.service'

@Controller('api/time')
export class TimeController {
	constructor(private readonly service: TimeService) {}

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
	async create(@Body() body: CreateTimeDto) {
		const data = await this.service.create(body)
		return { data }
	}

	@Put(':id')
	async update(@Param('id') id: string, @Body() body: UpdateTimeDto) {
		const data = await this.service.update(id, body)
		return { data }
	}

	@Delete(':id')
	async remove(@Param('id') id: string) {
		const data = await this.service.remove(id)
		return { data }
	}
}
