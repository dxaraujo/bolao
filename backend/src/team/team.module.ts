import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import { MediaModule } from '../media/media.module'
import { Team, TeamSchema } from './schemas/team.schema'
import { TeamController } from './team.controller'
import { TeamService } from './team.service'

@Module({
	imports: [MongooseModule.forFeature([{ name: Team.name, schema: TeamSchema }]), MediaModule],
	controllers: [TeamController],
	providers: [TeamService],
	exports: [TeamService, MongooseModule],
})
export class TeamModule {}
