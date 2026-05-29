import { Injectable, Logger, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { OAuth2Client, type TokenPayload } from 'google-auth-library'

import { UserService } from '../user/user.service'
import type { UserDocument } from '../user/schemas/user.schema'
import type { JwtPayload } from './jwt.strategy'

export interface GoogleProfile {
	googleSub: string
	email: string
	name: string
	givenName?: string
	picture: string
}

@Injectable()
export class AuthService {
	private readonly client: OAuth2Client
	private readonly googleClientId: string
	private readonly logger = new Logger(AuthService.name)

	constructor(
		config: ConfigService,
		private readonly jwtService: JwtService,
		private readonly userService: UserService,
	) {
		this.googleClientId = config.getOrThrow<string>('GOOGLE_CLIENT_ID')
		this.client = new OAuth2Client(this.googleClientId)
	}

	async loginWithGoogle(idToken: string) {
		const profile = await this.verifyGoogleToken(idToken)
		const user = await this.userService.upsertFromGoogle(profile)
		return { token: this.signToken(user) }
	}

	private async verifyGoogleToken(idToken: string): Promise<GoogleProfile> {
		try {
			const ticket = await this.client.verifyIdToken({ idToken, audience: this.googleClientId })
			const payload = ticket.getPayload()
			if (!payload) throw new UnauthorizedException('Google token payload incompleto')
			const { sub, email, name } = this.assertGoogleProfile(payload)
			return { googleSub: sub, email, name, givenName: payload.given_name, picture: payload.picture ?? '' }
		} catch (error) {
			if (error instanceof UnauthorizedException) throw error
			throw new UnauthorizedException('Falha ao verificar token do Google')
		}
	}

	private assertGoogleProfile(payload: TokenPayload) {
		const { sub, email, name } = payload
		if (!sub || !email || !name) throw new UnauthorizedException('Google token payload incompleto')
		if (!this.isEmailAuthoritative(email, payload.hd) && !payload.email_verified) {
			throw new UnauthorizedException('E-mail do Google não verificado')
		}
		return { sub, email, name }
	}

	private isEmailAuthoritative(email: string, hd?: string) {
		return email.endsWith('@gmail.com') || !!hd
	}

	private signToken(user: UserDocument): string {
		const id = user._id.toString()
		const claims: JwtPayload = {
			_id: id,
			email: user.email,
			name: user.name,
			avatar: user.avatar,
			isAdmin: user.isAdmin,
			isActive: user.isActive,
		}
		return this.jwtService.sign(claims)
	}
}
