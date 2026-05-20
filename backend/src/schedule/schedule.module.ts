import { Module } from '@nestjs/common'
import { ScheduleModule as NestScheduleModule } from '@nestjs/schedule'

import { PartidaModule } from '../partida/partida.module'
import { ResultadosTask } from './resultados.task'

@Module({
	imports: [NestScheduleModule.forRoot(), PartidaModule],
	providers: [ResultadosTask],
})
export class ScheduleModule {}
