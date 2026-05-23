import { Logger } from '@nestjs/common'
import { promises as fs } from 'node:fs'
import * as path from 'node:path'

const logger = new Logger('Download')

const EXT_BY_CONTENT_TYPE: Record<string, string> = {
	'image/svg+xml': '.svg',
	'image/png': '.png',
	'image/jpeg': '.jpg',
	'image/jpg': '.jpg',
	'image/webp': '.webp',
	'image/gif': '.gif',
}

export interface DownloadImageResult {
	relativePath: string
	contentType: string
}

/**
 * Baixa uma imagem da `url` para `dir/<basename><ext>`, onde `<ext>` vem do Content-Type.
 * Retorna `null` em qualquer falha — caller decide o fallback.
 */
export async function downloadImage(
	url: string,
	dir: string,
	basename: string,
	publicPrefix: string,
): Promise<DownloadImageResult | null> {

	try {
		const response = await fetch(url)

		if (!response.ok) {
			logger.warn(`Download failed (${response.status}) for ${url}`)
			return null
		}

		const contentType = (response.headers.get('content-type') ?? '').split(';')[0].trim().toLowerCase()
		const ext = EXT_BY_CONTENT_TYPE[contentType]

		if (!ext) {
			logger.warn(`Unsupported content-type "${contentType}" for ${url}`)
			return null
		}

		const buffer = Buffer.from(await response.arrayBuffer())
		await fs.mkdir(dir, { recursive: true })
		const fileName = `${basename}${ext}`
		await fs.writeFile(path.join(dir, fileName), buffer)

		return {
			relativePath: `${publicPrefix.replace(/\/$/, '')}/${fileName}`,
			contentType,
		}

	} catch (err) {
		logger.warn(`Download error for ${url}: ${(err as Error).message}`)
		return null
	}
}
