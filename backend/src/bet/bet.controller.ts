import { Body, Controller, Get, Put } from '@nestjs/common'
import { ApiBody, ApiTags } from '@nestjs/swagger'

import { JwtPayload } from '../auth/jwt.strategy'
import { CurrentUser } from '../common/current-user.decorator'
import { ApiProtectedInDocs } from '../common/swagger-auth.decorator'
import { BetService } from './bet.service'
import { UpdateBetsDto } from './dto/update-bets.dto'

@ApiTags('bet')
@Controller('api/bet')
@ApiProtectedInDocs()
export class BetController {

	constructor(private readonly service: BetService) { }

	@Get()
	async list(@CurrentUser() user: JwtPayload) {
		const data = await this.service.list(user._id)
		return { data }
	}

	@Get('all')
	async listAll() {
		const data = await this.service.listAll()
		return { data }
	}

	@Put('/updateBets')
	@ApiBody({ type: [UpdateBetsDto] })
	async updateBets(@CurrentUser() user: JwtPayload, @Body() body: { bets: UpdateBetsDto[] }) {
		return await this.service.updateBets(user._id, body.bets)
	}
}
