import {
	Body,
	Controller,
	Get,
	Param,
	Put,
	UseGuards
} from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'

import { AdminGuard } from 'src/common/admin.guard'
import { ApiProtectedInDocs } from '../common/swagger-auth.decorator'
import { UpdateStageDto } from './dto/update-stage.dto'
import { StageService } from './stage.service'

@ApiTags('stage')
@ApiProtectedInDocs()
@Controller('api/stage')
export class StageController {

	constructor(private readonly service: StageService) {}

	@Get('visible')
	async findVisible() {
		const data = await this.service.findVisibleStages()
		return { data }
	}

	@Get()
	@UseGuards(AdminGuard)
	async findAll() {
		const data = await this.service.findAll()
		return { data }
	}

	@Put(':matchStage')
	@UseGuards(AdminGuard)
	async update(@Param('matchStage') matchStage: string, @Body() body: UpdateStageDto) {
		const data = await this.service.update(matchStage, body)
		return { data }
	}
}
