import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import * as path from 'node:path'

import { downloadImage } from '../common/download'
import { isLocalStaticFileOnDisk, resolveStaticDir } from '../common/static-dir'

/**
 * Centraliza download e gestão de imagens locais (avatares de usuário, escudos de time).
 */
@Injectable()
export class MediaService {

	private readonly logger = new Logger(MediaService.name)
	readonly staticDir: string

	constructor(config: ConfigService) {
		this.staticDir = resolveStaticDir(config.get<string>('STATIC_DIR'))
	}

	/** Baixa um avatar para `/static/users/<id>.<ext>`. Retorna o path público ou null. */
	async downloadUserAvatar(userId: string, externalUrl: string): Promise<string | null> {
		const result = await downloadImage(externalUrl, path.join(this.staticDir, 'users'), userId, '/static/users')
		return result?.relativePath ?? null
	}

	/** Baixa um escudo para `/static/teams/<TLA>.<ext>`. Retorna o path público ou null. */
	async downloadTeamCrest(tla: string, externalUrl: string): Promise<string | null> {
		const result = await downloadImage(externalUrl, path.join(this.staticDir, 'teams'), tla, '/static/teams')
		return result?.relativePath ?? null
	}

	async isLocalAvailable(publicPath?: string | null): Promise<boolean> {
		return isLocalStaticFileOnDisk(this.staticDir, publicPath)
	}
}
