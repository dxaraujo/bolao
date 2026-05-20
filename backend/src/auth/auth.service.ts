import { Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { OAuth2Client } from 'google-auth-library'
import { Types } from 'mongoose'

import { UserService } from '../user/user.service'
import type { UserDocument } from '../user/schemas/user.schema'
import type { JwtPayload } from './jwt.strategy'

@Injectable()
export class AuthService {
	private readonly client: OAuth2Client
	private readonly googleClientId: string

	constructor(
		config: ConfigService,
		private readonly jwtService: JwtService,
		private readonly userService: UserService,
	) {
		this.googleClientId = config.getOrThrow<string>('GOOGLE_CLIENT_ID')
		this.client = new OAuth2Client(this.googleClientId)
	}

	async loginWithGoogle(idToken: string) {
		const payload = await this.verifyGoogleToken(idToken)
		const { email, name, picture } = payload

		const user =
			(await this.userService.findByEmail(email)) ??
			(await this.userService.create({ name, email, picture }))

		return { token: this.signToken(user) }
	}

	private async verifyGoogleToken(idToken: string) {
		try {
			const ticket = await this.client.verifyIdToken({
				idToken,
				audience: this.googleClientId,
			})
			const payload = ticket.getPayload()
			if (!payload?.email || !payload.name || !payload.picture) {
				throw new UnauthorizedException('Google token payload incompleto')
			}
			return { email: payload.email, name: payload.name, picture: payload.picture }
		} catch {
			throw new UnauthorizedException('Falha ao verificar token do Google')
		}
	}

	private signToken(user: UserDocument): string {
		const id = (user._id as Types.ObjectId).toString()
		const claims: JwtPayload = {
			_id: id,
			email: user.email,
			name: user.name,
			picture: user.picture,
			isAdmin: user.isAdmin,
			ativo: user.ativo,
		}
		return this.jwtService.sign(claims)
	}
}
