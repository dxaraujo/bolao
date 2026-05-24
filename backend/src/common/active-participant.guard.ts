import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common'

import type { JwtPayload } from '../auth/jwt.strategy'

/**
 * Restringe a rota a participantes ativos (pagantes).
 * Espectadores (`isActive: false`) recebem 403.
 *
 * Roda em cima do JwtAuthGuard global. Service deve revalidar contra o banco
 * (JWT pode estar desatualizado se admin desativou o usuário).
 */
@Injectable()
export class ActiveParticipantGuard implements CanActivate {
	canActivate(context: ExecutionContext): boolean {
		const user = context.switchToHttp().getRequest<{ user: JwtPayload }>().user
		if (!user?.isActive) {
			throw new ForbiddenException('Apenas participantes ativos podem realizar esta ação')
		}
		return true
	}
}
