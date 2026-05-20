import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'

export interface JwtPayload {
	_id: string
	email: string
	name: string
	picture?: string
	isAdmin?: boolean
	ativo?: boolean
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
	constructor(config: ConfigService) {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			ignoreExpiration: false,
			secretOrKey: config.getOrThrow<string>('AUTH_SECRET'),
		})
	}

	validate(payload: JwtPayload): JwtPayload {
		return payload
	}
}
