import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import { StageModule } from '../stage/stage.module'
import { User, UserSchema } from './schemas/user.schema'
import { UserController } from './user.controller'
import { UserService } from './user.service'

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: User.name, schema: UserSchema }
		]),
		StageModule,
	],
	controllers: [UserController],
	providers: [UserService],
	exports: [UserService],
})
export class UserModule { }
