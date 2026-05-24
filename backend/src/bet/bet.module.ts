import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import { MatchModule } from '../match/match.module'
import { StageModule } from '../stage/stage.module'
import { UserModule } from '../user/user.module'
import { BetController } from './bet.controller'
import { BetService } from './bet.service'
import { Bet, BetSchema } from './schemas/bet.schema'

@Module({
	imports: [
		MongooseModule.forFeature([{ name: Bet.name, schema: BetSchema }]),
		MatchModule,
		StageModule,
		UserModule,
	],
	controllers: [BetController],
	providers: [BetService],
	exports: [BetService, MongooseModule],
})
export class BetModule {}
