import { Body, Controller, Get, Param, Put, UseGuards } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'

import type { JwtPayload } from '../auth/jwt.strategy'
import { AdminGuard } from '../common/admin.guard'
import { CurrentUser } from '../common/current-user.decorator'
import { ApiProtectedInDocs } from '../common/swagger-auth.decorator'
import { UpdateUserDto } from './dto/update-user.dto'
import { UserService } from './user.service'

@ApiTags('user')
@ApiProtectedInDocs()
@Controller('api/user')
export class UserController {
	constructor(private readonly userService: UserService) { }

	@Get('authenticated')
	async authenticated(@CurrentUser() user: JwtPayload) {
		const data = await this.userService.findById(user._id)
		return { data }
	}
	
	@Get('active')
	async findActiveUsers() {
		const data = await this.userService.findActiveUsers()
		return { data }
	}

	@Get()
	@UseGuards(AdminGuard)
	async findAll() {
		const data = await this.userService.findAll()
		return { data }
	}

	@Put(':id')
	@UseGuards(AdminGuard)
	async update(@Param('id') id: string, @Body() body: UpdateUserDto) {
		const data = await this.userService.update(id, body)
		return { data }
	}
}
