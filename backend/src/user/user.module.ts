import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import { MediaModule } from '../media/media.module'
import { User, UserSchema } from './schemas/user.schema'
import { UserController } from './user.controller'
import { LeaderboardModule } from '../leaderboard/leaderboard.module'
import { UserService } from './user.service'

@Module({
	imports: [MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]), MediaModule, LeaderboardModule],
	controllers: [UserController],
	providers: [UserService],
	exports: [UserService, MongooseModule],
})
export class UserModule {}
