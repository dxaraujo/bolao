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
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger'

import { CreateBetDto } from './dto/create-bet.dto'
import { UpdateBetDto } from './dto/update-bet.dto'
import { BetUpdateItemDto } from './dto/update-bets.dto'
import { BetService } from './bet.service'

@ApiTags('bet')
@ApiBearerAuth('access-token')
@Controller('api/bet')
export class BetController {
	constructor(private readonly service: BetService) {}

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
	async create(@Body() body: CreateBetDto) {
		const data = await this.service.create(body)
		return { data }
	}

	@Put('/:user/updateBets')
	@ApiOperation({ summary: 'Atualiza placares de múltiplos palpites em lote' })
	@ApiBody({ type: [BetUpdateItemDto] })
	async updateBets(
		@Body(new ParseArrayPipe({ items: BetUpdateItemDto }))
		body: BetUpdateItemDto[],
	) {
		const data = await this.service.updateBets(body)
		return { data }
	}

	@Get('/:user/:phase/montarbets')
	@ApiOperation({
		summary:
			'Retorna palpites do usuário para a phase agrupados por grupo/rodada; cria palpites em branco se não existirem',
	})
	async montarBets(@Param('user') user: string, @Param('phase') phase: string) {
		const data = await this.service.montarParaPhase(user, phase)
		return { data }
	}

	@Put(':id')
	async update(@Param('id') id: string, @Body() body: UpdateBetDto) {
		const data = await this.service.update(id, body)
		return { data }
	}

	@Delete(':id')
	async remove(@Param('id') id: string) {
		const data = await this.service.remove(id)
		return { data }
	}
}
