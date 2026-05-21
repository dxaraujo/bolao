import { Body, Controller, Get, ParseArrayPipe, Put, Query } from '@nestjs/common'
import { ApiBody, ApiTags } from '@nestjs/swagger'

import { JwtPayload } from '../auth/jwt.strategy'
import { CurrentUser } from '../common/current-user.decorator'
import { ApiProtectedInDocs } from '../common/swagger-auth.decorator'
import { BetService } from './bet.service'
import { BetUpdateItemDto } from './dto/update-bets.dto'

@ApiTags('bet')
@Controller('api/bet')
@ApiProtectedInDocs()
export class BetController {

	constructor(private readonly service: BetService) { }

	@Get()
	async list(@CurrentUser() user: JwtPayload) {
		const data = await this.service.findAll(user._id)
		return { data }
	}

	@Put('/updateBets')
	@ApiBody({ type: [BetUpdateItemDto] })
	async updateBets(@CurrentUser() user: JwtPayload, @Body(new ParseArrayPipe({ items: BetUpdateItemDto })) body: BetUpdateItemDto[]) {
		const data = await this.service.updateBets(user._id, body)
		return { data }
	}
}
