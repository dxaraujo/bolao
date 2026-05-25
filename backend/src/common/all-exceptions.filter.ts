import { nowtoLocalISOString, type ApiErrorBody } from '@bolao/shared'
import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common'
import type { Request, Response } from 'express'

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
	private readonly logger = new Logger(AllExceptionsFilter.name)

	catch(exception: unknown, host: ArgumentsHost) {
		const ctx = host.switchToHttp()
		const res = ctx.getResponse<Response>()
		const req = ctx.getRequest<Request>()

		const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR

		if (status >= 500) {
			this.logger.error(`${req.method} ${req.url} → ${status}`, exception instanceof Error ? exception.stack : exception)
		}

		const body: ApiErrorBody = {
			errors: messageFrom(exception),
			statusCode: status,
			path: req.url,
			timestamp: nowtoLocalISOString(),
		}

		res.status(status).json(body)
	}
}

function messageFrom(exception: unknown): string | string[] {
	if (exception instanceof HttpException) {
		const body = exception.getResponse()
		if (typeof body === 'string') return body
		if (typeof body === 'object' && body !== null && 'message' in body) {
			const msg = (body as { message: unknown }).message
			if (typeof msg === 'string' || Array.isArray(msg)) return msg
		}
		return exception.message
	}
	return exception instanceof Error ? exception.message : 'Internal Server Error'
}
