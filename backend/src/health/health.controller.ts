import { Controller, Get } from '@nestjs/common'

@Controller('healthcheck')
export class HealthController {
	@Get()
	healthcheck() {
		return {
			uptime: process.uptime(),
			message: 'OK',
			timestamp: Date.now(),
		}
	}
}
