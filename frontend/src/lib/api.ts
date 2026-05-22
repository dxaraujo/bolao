import type { ApiResponse, ApiErrorBody } from '@bolao/shared'
import { isApiError } from '@bolao/shared'

const TOKEN_KEY = 'copabet.token'

export function getToken(): string | null {
	return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string | null) {
	if (token) localStorage.setItem(TOKEN_KEY, token)
	else localStorage.removeItem(TOKEN_KEY)
}

export class ApiError extends Error {
	statusCode: number
	body: ApiErrorBody
	constructor(body: ApiErrorBody) {
		super(Array.isArray(body.errors) ? body.errors.join(', ') : body.errors)
		this.name = 'ApiError'
		this.statusCode = body.statusCode
		this.body = body
	}
}

type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

interface RequestOptions {
	method?: Method
	body?: unknown
	signal?: AbortSignal
	/** Quando false, retorna o JSON da resposta direto (ex.: `{ token }` em /auth/google). */
	envelope?: boolean
}

const API_BASE = (import.meta.env.VITE_API_URL ?? '').replace(/\/+$/, '')

function buildUrl(path: string) {
	if (/^https?:\/\//i.test(path)) return path
	if (!API_BASE) return path
	return path.startsWith('/') ? `${API_BASE}${path}` : `${API_BASE}/${path}`
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
	const token = getToken()
	const res = await fetch(buildUrl(path), {
		method: options.method ?? 'GET',
		headers: {
			'Content-Type': 'application/json',
			...(token ? { Authorization: `Bearer ${token}` } : {}),
		},
		body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
		signal: options.signal,
	})

	if (res.status === 401) {
		setToken(null)
		window.dispatchEvent(new CustomEvent('copabet:unauthorized'))
	}

	const payload = (await res.json().catch(() => ({}))) as ApiResponse<T>

	if (!res.ok || isApiError(payload)) {
		throw new ApiError(payload as ApiErrorBody)
	}

	if (options.envelope === false) {
		return payload as T
	}

	return (payload as { data: T }).data
}

export const api = {
	get: <T>(path: string, signal?: AbortSignal) => request<T>(path, { signal }),
	post: <T>(path: string, body?: unknown, opts?: { envelope?: boolean }) => request<T>(path, { method: 'POST', body, envelope: opts?.envelope }),
	put: <T>(path: string, body?: unknown) => request<T>(path, { method: 'PUT', body }),
	del: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
}
