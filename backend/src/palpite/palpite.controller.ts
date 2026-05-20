import {
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	HttpStatus,
	Param,
	ParseArrayPipe,
	Post,
	Put,
	Query,
} from '@nestjs/common'

import { CreatePalpiteDto } from './dto/create-palpite.dto'
import { UpdatePalpiteDto } from './dto/update-palpite.dto'
import { PalpiteUpdateItemDto } from './dto/update-palpites.dto'
import { PalpiteService } from './palpite.service'

@Controller('api/palpite')
export class PalpiteController {
	constructor(private readonly service: PalpiteService) {}

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
	async create(@Body() body: CreatePalpiteDto) {
		const data = await this.service.create(body)
		return { data }
	}

	@Put('/:user/updatePalpites')
	async updatePalpites(
		@Body(new ParseArrayPipe({ items: PalpiteUpdateItemDto }))
		body: PalpiteUpdateItemDto[],
	) {
		const data = await this.service.updatePalpites(body)
		return { data }
	}

	@Get('/:user/:fase/montarpalpites')
	async montarPalpites(@Param('user') user: string, @Param('fase') fase: string) {
		const data = await this.service.montarParaFase(user, fase)
		return { data }
	}

	@Put(':id')
	async update(@Param('id') id: string, @Body() body: UpdatePalpiteDto) {
		const data = await this.service.update(id, body)
		return { data }
	}

	@Delete(':id')
	async remove(@Param('id') id: string) {
		const data = await this.service.remove(id)
		return { data }
	}
}
