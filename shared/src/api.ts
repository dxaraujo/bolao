/**
 * Contratos de envelope de resposta da API.
 *
 * Backend sempre retorna `{ data: T }` para sucesso e `{ errors, statusCode, path, timestamp, requestId }`
 * para erro. Tipar esses envelopes garante que o frontend e os testes não acessem `data` num erro.
 */

export interface ApiSuccess<T> {
	data: T
}

export interface ApiErrorBody {
	errors: string | string[]
	statusCode: number
	path: string
	timestamp: string
	requestId?: string
}

export type ApiResponse<T> = ApiSuccess<T> | ApiErrorBody

export const isApiError = <T>(res: ApiResponse<T>): res is ApiErrorBody => (res as ApiErrorBody).errors !== undefined
