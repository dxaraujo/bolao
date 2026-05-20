import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import { Team, TeamSchema } from './schemas/team.schema'
import { TeamImportService } from './team-import.service'
import { TeamController } from './team.controller'
import { TeamService } from './team.service'

@Module({
	imports: [MongooseModule.forFeature([{ name: Team.name, schema: TeamSchema }])],
	controllers: [TeamController],
	providers: [TeamService, TeamImportService],
	exports: [TeamService],
})
export class TeamModule { }
