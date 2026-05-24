import { Controller, Get, Post, UseGuards } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'

import { AdminGuard } from '../common/admin.guard'
import { ApiProtectedInDocs } from '../common/swagger-auth.decorator'
import { LeaderboardService } from './leaderboard.service'

@ApiTags('leaderboard')
@Controller('api/leaderboard')
@ApiProtectedInDocs()
export class LeaderboardController {
	constructor(private readonly service: LeaderboardService) {}

	@Get()
	async get() {
		const data = await this.service.getCurrent()
		return { data }
	}

	@Get('stats/overview')
	async overview() {
		const data = await this.service.statsOverview()
		return { data }
	}

	@Get('stats/accuracy-by-user')
	async accuracy() {
		const data = await this.service.statsAccuracy()
		return { data }
	}

	@Get('stats/distribution')
	async distribution() {
		const data = await this.service.statsDistribution()
		return { data }
	}

	@Post('rebuild')
	@UseGuards(AdminGuard)
	async rebuild() {
		const data = await this.service.rebuild()
		return { data }
	}
}
