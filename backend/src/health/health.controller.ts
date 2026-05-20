import { Controller, Get } from '@nestjs/common'
import { ApiOkResponse, ApiTags } from '@nestjs/swagger'

@ApiTags('health')
@Controller('healthcheck')
export class HealthController {
	@Get()
	@ApiOkResponse({
		description: 'Status do servidor',
		schema: {
			type: 'object',
			properties: {
				uptime: { type: 'number' },
				message: { type: 'string', example: 'OK' },
				timestamp: { type: 'number' },
			},
		},
	})
	healthcheck() {
		return {
			uptime: process.uptime(),
			message: 'OK',
			timestamp: Date.now(),
		}
	}
}
