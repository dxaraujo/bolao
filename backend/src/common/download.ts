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

	const absDir = path.resolve(dir)
	logger.log(`Downloading image: url=${url} dir=${absDir} basename=${basename}`)

	try {
		const response = await fetch(url)

		if (!response.ok) {
			logger.warn(`Download failed (HTTP ${response.status}) for ${url}`)
			return null
		}

		const contentType = (response.headers.get('content-type') ?? '').split(';')[0].trim().toLowerCase()
		const ext = EXT_BY_CONTENT_TYPE[contentType]

		if (!ext) {
			logger.warn(`Unsupported content-type "${contentType}" for ${url}`)
			return null
		}

		const buffer = Buffer.from(await response.arrayBuffer())

		try {
			await fs.mkdir(absDir, { recursive: true })
		} catch (err) {
			logger.error(`mkdir failed for ${absDir}: ${(err as Error).message}`)
			throw err
		}

		const fileName = `${basename}${ext}`
		const absPath = path.join(absDir, fileName)

		try {
			await fs.writeFile(absPath, buffer)
		} catch (err) {
			logger.error(`writeFile failed for ${absPath}: ${(err as Error).message}`)
			throw err
		}

		let writtenSize: number | undefined
		try {
			const stat = await fs.stat(absPath)
			writtenSize = stat.size
		} catch (err) {
			logger.warn(`stat failed for ${absPath}: ${(err as Error).message}`)
		}

		const relativePath = `${publicPrefix.replace(/\/$/, '')}/${fileName}`
		logger.log(
			`Image saved: path=${absPath} size=${writtenSize ?? '?'}B contentType=${contentType} relative=${relativePath}`,
		)

		return {
			relativePath,
			contentType,
		}

	} catch (err) {
		logger.error(`Download error for ${url}: ${(err as Error).message}`, (err as Error).stack)
		return null
	}
}
