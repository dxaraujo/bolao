import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import { Fase, FaseSchema } from '../fase/schemas/fase.schema'
import { Palpite, PalpiteSchema } from '../palpite/schemas/palpite.schema'
import { User, UserSchema } from './schemas/user.schema'
import { UserController } from './user.controller'
import { UserService } from './user.service'

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: User.name, schema: UserSchema },
			{ name: Fase.name, schema: FaseSchema },
			{ name: Palpite.name, schema: PalpiteSchema },
		]),
	],
	controllers: [UserController],
	providers: [UserService],
	exports: [UserService],
})
export class UserModule {}
