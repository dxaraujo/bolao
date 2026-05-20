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

import { CreatePartidaDto } from './dto/create-partida.dto'
import { UpdatePartidaDto } from './dto/update-partida.dto'
import { UpdateResultadoDto } from './dto/update-resultado.dto'
import { PartidaService } from './partida.service'
import { ResultadoService } from './resultado.service'

@Controller('api/partida')
export class PartidaController {
	constructor(
		private readonly service: PartidaService,
		private readonly resultadoService: ResultadoService,
	) {}

	@Get()
	async list(@Query() query: Record<string, unknown>) {
		const data = await this.service.findAll(query)
		return { data }
	}

	@Get('resultado')
	async listResultados() {
		const data = await this.service.findResultados()
		return { data }
	}

	@Get(':id')
	async getById(@Param('id') id: string) {
		const data = await this.service.findById(id)
		return { data }
	}

	@Post()
	@HttpCode(HttpStatus.CREATED)
	async create(@Body() body: CreatePartidaDto) {
		const data = await this.service.create(body)
		return { data }
	}

	@Put(':id/updateResultado')
	async updateResultado(@Param('id') id: string, @Body() body: UpdateResultadoDto) {
		const data = await this.resultadoService.atualizarResultados(id, body)
		return { data }
	}

	@Put(':id')
	async update(@Param('id') id: string, @Body() body: UpdatePartidaDto) {
		const data = await this.service.update(id, body)
		return { data }
	}

	@Delete(':id')
	async remove(@Param('id') id: string) {
		const data = await this.service.remove(id)
		return { data }
	}
}
