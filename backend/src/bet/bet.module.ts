import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import { Match, MatchSchema } from '../match/schemas/match.schema'
import { Stage, StageSchema } from '../stage/schemas/stage.schema'
import { UserModule } from '../user/user.module'
import { BetController } from './bet.controller'
import { BetService } from './bet.service'
import { Bet, BetSchema } from './schemas/bet.schema'

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: Bet.name, schema: BetSchema },
			{ name: Stage.name, schema: StageSchema },
			{ name: Match.name, schema: MatchSchema },
		]),
		UserModule,
	],
	controllers: [BetController],
	providers: [BetService],
	exports: [BetService],
})
export class BetModule {}
