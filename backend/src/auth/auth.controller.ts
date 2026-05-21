import { Body, Controller, Post } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'

import { Public } from '../common/public.decorator'
import { AuthService } from './auth.service'
import { GoogleLoginDto } from './dto/google-login.dto'

@ApiTags('auth')
@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Public()
	@Post('google')
	loginWithGoogle(@Body() body: GoogleLoginDto) {
		return this.authService.loginWithGoogle(body.credential)
	}
}
