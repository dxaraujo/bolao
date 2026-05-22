import type { ApiErrorBody, ApiSuccess } from '@/api/types'

const TOKEN_KEY = 'copabet_token'

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY)
}

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

function baseUrl() {
  return import.meta.env.VITE_API_URL ?? ''
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getToken()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }
  if (token) headers.Authorization = `Bearer ${token}`

  const res = await fetch(`${baseUrl()}${path}`, { ...options, headers })

  if (res.status === 204) return undefined as T

  const body = await res.json().catch(() => ({}))

  if (!res.ok) {
    const err = body as ApiErrorBody
    const msg = Array.isArray(err.errors) ? err.errors.join(', ') : err.errors ?? res.statusText
    throw new ApiError(msg, err.statusCode ?? res.status)
  }

  return body as T
}

export async function apiData<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await apiFetch<ApiSuccess<T>>(path, options)
  return res.data
}

export const api = {
  loginGoogle: (credential: string) =>
    apiFetch<{ token: string }>('/auth/google', {
      method: 'POST',
      body: JSON.stringify({ credential }),
    }),

  getMe: () => apiData<import('@/api/types').ApiUser>('/api/user/authenticated'),
  getActiveUsers: () => apiData<import('@/api/types').ApiUser[]>('/api/user/active'),
  getStages: () => apiData<import('@/api/types').ApiStage[]>('/api/stage/visible'),
  getMatches: () => apiData<import('@/api/types').ApiMatch[]>('/api/match/visible'),
  getBets: () => apiData<import('@/api/types').ApiBet[]>('/api/bet'),
  getBetsByMatch: (matchId: string) =>
    apiData<import('@/api/types').ApiBet[]>(`/api/bet/by-match/${matchId}`),
  updateBets: (items: { _id: string; homeTeamScore?: number; awayTeamScore?: number }[]) =>
    apiData<import('@/api/types').ApiBet[]>('/api/bet/updateBets', {
      method: 'PUT',
      body: JSON.stringify(items),
    }),
  getConfig: () => apiData<import('@/api/types').ApiConfig | null>('/api/config'),
}
