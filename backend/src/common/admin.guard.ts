import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common'

import type { JwtPayload } from '../auth/jwt.strategy'

@Injectable()
export class AdminGuard implements CanActivate {
	canActivate(context: ExecutionContext): boolean {
		const user = context.switchToHttp().getRequest<{ user: JwtPayload }>().user
		if (!user?.isAdmin) throw new ForbiddenException('Acesso restrito a administradores')
		return true
	}
}
