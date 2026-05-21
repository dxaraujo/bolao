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
	async list(@Query() query: Record<string, unknown>) {
		const data = await this.service.findAll(query)
		return { data }
	}

	@Put(':name')
	async update(@Param('name') name: string, @Body() body: UpdateStageDto) {
		const data = await this.service.update(name, body)
		return { data }
	}
}
