import { Controller, Get, Post, UseGuards } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'

import { AdminGuard } from 'src/common/admin.guard'

import { ApiProtectedInDocs } from 'src/common/swagger-auth.decorator'
import { MatchService } from './match.service'
import { ScoreService } from './score.service'

@ApiTags('match')
@Controller('api/match')
@ApiProtectedInDocs()
export class MatchController {

	constructor(
		private readonly service: MatchService,
		private readonly scoreService: ScoreService,
	) { }

	@Get()
	async list() {
		const data = await this.service.list()
		return { data }
	}

	@Post('import')
	@UseGuards(AdminGuard)
	async import() {
		await this.service.importMatches()
		return { data: 'Matches imported successfully' }
	}

	@Post('update-scores')
	@UseGuards(AdminGuard)
	async updateScores() {
		await this.scoreService.updateScores()
		return { data: 'Scores updated successfully' }
	}
}
