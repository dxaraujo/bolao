import * as path from 'node:path'

function backendRoot(): string {
	return path.join(path.dirname(require.main?.filename ?? __dirname), '..')
}

export function resolveStaticDir(configValue?: string): string {
	const root = backendRoot()

	if (configValue) {
		return path.isAbsolute(configValue) ? configValue : path.resolve(root, configValue)
	}

	return path.join(root, 'static')
}
