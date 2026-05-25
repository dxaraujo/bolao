import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'

import { JwtPayload } from '../auth/jwt.strategy'
import { ActiveParticipantGuard } from '../common/active-participant.guard'
import { CurrentUser } from '../common/current-user.decorator'
import { ApiProtectedInDocs } from '../common/swagger-auth.decorator'
import { BetService } from './bet.service'
import { BetSubmitDto } from './dto/update-bets.dto'

@ApiTags('bet')
@Controller('api/bet')
@ApiProtectedInDocs()
export class BetController {
	constructor(private readonly service: BetService) {}

	@Get()
	async list(@CurrentUser() user: JwtPayload) {
		const data = await this.service.listMine(user._id)
		return { data }
	}

	@Get('all')
	async listGrouped() {
		const data = await this.service.listGrouped()
		return { data }
	}

	@Put()
	@UseGuards(ActiveParticipantGuard)
	async submit(@CurrentUser() user: JwtPayload, @Body() body: BetSubmitDto) {
		const data = await this.service.submit(user._id, body)
		return { data }
	}
}
