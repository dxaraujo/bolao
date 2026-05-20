import { Controller, Post, Query } from '@nestjs/common'

import { Public } from '../common/public.decorator'
import { AuthService } from './auth.service'
import { GoogleLoginDto } from './dto/google-login.dto'

@Controller()
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Public()
	@Post('registerGoogleUser')
	registerGoogleUser(@Query() query: GoogleLoginDto) {
		return this.authService.loginWithGoogle(query.token)
	}
}
