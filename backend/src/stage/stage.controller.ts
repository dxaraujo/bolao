import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { MatchStage } from '@bolao/shared'

import { AdminGuard } from '../common/admin.guard'
import { ApiProtectedInDocs } from '../common/swagger-auth.decorator'
import { UpdateStageDto } from './dto/update-stage.dto'
import { StageService } from './stage.service'

@ApiTags('stage')
@ApiProtectedInDocs()
@Controller('api/stage')
export class StageController {
	constructor(private readonly service: StageService) {}

	@Get()
	async list() {
		const data = await this.service.list()
		return { data }
	}

	@Get('readiness')
	@UseGuards(AdminGuard)
	async readiness() {
		const data = await this.service.readiness()
		return { data }
	}

	@Patch(':code')
	@UseGuards(AdminGuard)
	async update(@Param('code') code: MatchStage, @Body() body: UpdateStageDto) {
		const data = await this.service.update(code, body)
		return { data }
	}
}
