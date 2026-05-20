import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import { Phase, PhaseSchema } from '../phase/schemas/phase.schema'
import { Bet, BetSchema } from '../bet/schemas/bet.schema'
import { User, UserSchema } from './schemas/user.schema'
import { UserController } from './user.controller'
import { UserService } from './user.service'

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: User.name, schema: UserSchema },
			{ name: Phase.name, schema: PhaseSchema },
			{ name: Bet.name, schema: BetSchema },
		]),
	],
	controllers: [UserController],
	providers: [UserService],
	exports: [UserService],
})
export class UserModule {}
