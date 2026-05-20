import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import { Phase, PhaseSchema } from '../phase/schemas/phase.schema'
import { Match, MatchSchema } from '../match/schemas/match.schema'
import { BetController } from './bet.controller'
import { BetService } from './bet.service'
import { Bet, BetSchema } from './schemas/bet.schema'

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: Bet.name, schema: BetSchema },
			{ name: Phase.name, schema: PhaseSchema },
			{ name: Match.name, schema: MatchSchema },
		]),
	],
	controllers: [BetController],
	providers: [BetService],
	exports: [BetService],
})
export class BetModule {}
