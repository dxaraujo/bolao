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
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'

import { CreateMatchDto } from './dto/create-match.dto'
import { UpdateMatchDto } from './dto/update-match.dto'
import { UpdateScoreDto } from './dto/update-score.dto'
import { MatchService } from './match.service'
import { ResultService } from './result.service'

@ApiTags('match')
@ApiBearerAuth('access-token')
@Controller('api/match')
export class MatchController {
	constructor(
		private readonly service: MatchService,
		private readonly resultService: ResultService,
	) {}

	@Get()
	async list(@Query() query: Record<string, unknown>) {
		const data = await this.service.findAll(query)
		return { data }
	}

	@Get('resultado')
	@ApiOperation({ summary: 'Partidas já encerradas (com placar definido)' })
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
	async create(@Body() body: CreateMatchDto) {
		const data = await this.service.create(body)
		return { data }
	}

	@Put(':id/updateResultado')
	@ApiOperation({
		summary: 'Atualiza o placar de uma partida e dispara recálculo de pontuação dos palpites',
	})
	async updateResultado(@Param('id') id: string, @Body() body: UpdateScoreDto) {
		const data = await this.resultService.atualizarResults(id, body)
		return { data }
	}

	@Put(':id')
	async update(@Param('id') id: string, @Body() body: UpdateMatchDto) {
		const data = await this.service.update(id, body)
		return { data }
	}

	@Delete(':id')
	async remove(@Param('id') id: string) {
		const data = await this.service.remove(id)
		return { data }
	}
}
