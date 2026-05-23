import { access, mkdir } from 'node:fs/promises'
import * as path from 'node:path'

/** Backend package root (`backend/`), derived from compiled `dist/common/static-dir.js`. */
function backendRoot(): string {
	return path.join(__dirname, '..', '..')
}

export function resolveStaticDir(configValue?: string): string {
	const root = backendRoot()

	if (configValue) {
		return path.isAbsolute(configValue) ? configValue : path.resolve(root, configValue)
	}

	return path.join(root, 'static')
}

export async function ensureStaticDir(staticDir: string): Promise<void> {
	await mkdir(staticDir, { recursive: true })
}

export function localStaticPath(staticDir: string, publicPath: string): string | null {
	if (!publicPath.startsWith('/static/')) return null
	return path.join(staticDir, publicPath.slice('/static/'.length))
}

export async function isLocalStaticFileOnDisk(staticDir: string, publicPath?: string | null): Promise<boolean> {
	const abs = publicPath ? localStaticPath(staticDir, publicPath) : null
	if (!abs) return false

	try {
		await access(abs)
		return true
	} catch {
		return false
	}
}
