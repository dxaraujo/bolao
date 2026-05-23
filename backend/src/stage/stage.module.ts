import { forwardRef, Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import { BetModule } from '../bet/bet.module'
import { Match, MatchSchema } from '../match/schemas/match.schema'
import { Stage, StageSchema } from './schemas/stage.schema'
import { StageController } from './stage.controller'
import { StageService } from './stage.service'

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: Stage.name, schema: StageSchema },
			{ name: Match.name, schema: MatchSchema },
		]),
		forwardRef(() => BetModule),
	],
	controllers: [StageController],
	providers: [StageService],
	exports: [StageService],
})
export class StageModule {}
