import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import { Bet, BetSchema } from '../bet/schemas/bet.schema'
import { Match, MatchSchema } from '../match/schemas/match.schema'
import { Stage, StageSchema } from '../stage/schemas/stage.schema'
import { User, UserSchema } from './schemas/user.schema'
import { UserController } from './user.controller'
import { UserService } from './user.service'

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: User.name, schema: UserSchema },
			{ name: Bet.name, schema: BetSchema },
			{ name: Stage.name, schema: StageSchema },
			{ name: Match.name, schema: MatchSchema },
		]),
	],
	controllers: [UserController],
	providers: [UserService],
	exports: [UserService],
})
export class UserModule { }
