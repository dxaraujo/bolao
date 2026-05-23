const API_BASE = (import.meta.env.VITE_API_URL ?? '').replace(/\/+$/, '')

/** Resolve paths served by the backend (`/static/...`) when frontend and API are on different hosts. */
export function resolveAssetUrl(src?: string | null): string | undefined {
	if (!src) return undefined
	if (/^https?:\/\//i.test(src)) return src
	if (src.startsWith('/static/') && API_BASE) return `${API_BASE}${src}`
	return src
}
