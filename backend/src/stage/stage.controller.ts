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
import { ApiTags } from '@nestjs/swagger'

import { ApiProtectedInDocs } from '../common/swagger-auth.decorator'
import { UpdateStageDto } from './dto/update-stage.dto'
import { StageService } from './stage.service'

@ApiTags('stage')
@ApiProtectedInDocs()
@Controller('api/stage')
export class StageController {

	constructor(private readonly service: StageService) {}

	@Get()
	async findAll() {
		const data = await this.service.findAll()
		return { data }
	}

	@Get('visible')
	async findVisible() {
		const data = await this.service.findVisibleStages()
		return { data }
	}

	@Put(':matchStage')
	async update(@Param('matchStage') matchStage: string, @Body() body: UpdateStageDto) {
		const data = await this.service.update(matchStage, body)
		return { data }
	}
}
