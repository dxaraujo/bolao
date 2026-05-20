import {
	ArgumentsHost,
	Catch,
	ExceptionFilter,
	HttpException,
	HttpStatus,
	Logger,
} from '@nestjs/common'
import type { Request, Response } from 'express'

interface ErrorBody {
	errors: string | string[]
	statusCode: number
	path: string
	timestamp: string
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
	private readonly logger = new Logger(AllExceptionsFilter.name)

	catch(exception: unknown, host: ArgumentsHost) {
		const ctx = host.switchToHttp()
		const response = ctx.getResponse<Response>()
		const request = ctx.getRequest<Request>()

		const status =
			exception instanceof HttpException
				? exception.getStatus()
				: HttpStatus.INTERNAL_SERVER_ERROR

		const errors = extractErrors(exception)

		if (status >= 500) {
			this.logger.error(
				`${request.method} ${request.url} → ${status}`,
				exception instanceof Error ? exception.stack : String(exception),
			)
		}

		const body: ErrorBody = {
			errors,
			statusCode: status,
			path: request.url,
			timestamp: new Date().toISOString(),
		}
		response.status(status).json(body)
	}
}

const extractErrors = (exception: unknown): string | string[] => {
	if (exception instanceof HttpException) {
		const res = exception.getResponse()
		if (typeof res === 'string') return res
		if (res && typeof res === 'object') {
			const obj = res as Record<string, unknown>
			if (Array.isArray(obj.message)) return obj.message as string[]
			if (typeof obj.message === 'string') return obj.message
			if (typeof obj.error === 'string') return obj.error
		}
		return exception.message
	}
	if (exception instanceof Error) return exception.message
	return 'Internal Server Error'
}
