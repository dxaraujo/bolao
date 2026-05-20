import {
	Body,
	Controller,
	Delete,
	Get,
	NotFoundException,
	Param,
	Put,
	Query,
} from '@nestjs/common'

import { CurrentUser } from '../common/current-user.decorator'
import type { JwtPayload } from '../auth/jwt.strategy'
import { UpdateUserDto } from './dto/update-user.dto'
import { UserService } from './user.service'

@Controller('api/user')
export class UserController {
	constructor(private readonly userService: UserService) {}

	@Get('authenticated')
	async authenticated(@CurrentUser() user: JwtPayload) {
		const data = await this.userService.findById(user._id)
		return { data }
	}

	@Get()
	async list(@Query() query: Record<string, unknown>) {
		const data = await this.userService.findAllWithPalpites(query)
		return { data }
	}

	@Get(':id')
	async getById(@Param('id') id: string) {
		const data = await this.userService.findById(id)
		return { data }
	}

	@Put(':id')
	async update(@Param('id') id: string, @Body() body: UpdateUserDto) {
		const data = await this.userService.update(id, body)
		return { data }
	}

	@Delete(':id')
	async remove(@Param('id') id: string) {
		const data = await this.userService.remove(id)
		if (!data) throw new NotFoundException('Usuário não encontrado')
		return { data }
	}
}
