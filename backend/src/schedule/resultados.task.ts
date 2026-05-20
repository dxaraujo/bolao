import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Cron } from '@nestjs/schedule'
import { isEqual, parseISO, subHours } from 'date-fns'

import { ResultadoService } from '../partida/resultado.service'
import { PartidaService } from '../partida/partida.service'

interface JogoExterno {
	data: string
	time1_nome_min: string
	time2_nome_min: string
	time1_gols?: string
	time2_gols?: string
}

@Injectable()
export class ResultadosTask {
	private readonly logger = new Logger(ResultadosTask.name)
	private readonly apiUrl: string

	constructor(
		config: ConfigService,
		private readonly partidaService: PartidaService,
		private readonly resultadoService: ResultadoService,
	) {
		this.apiUrl = config.getOrThrow<string>('RESULTADOS_API_URL')
	}

	@Cron('*/5 7-20 * * *')
	async sincronizar() {
		const inicio = subHours(new Date(), 3)
		this.logger.log(`Iniciou atualização dos resultados: ${inicio.toISOString()}`)

		try {
			const response = await fetch(this.apiUrl)
			if (!response.ok) {
				this.logger.warn(`API externa retornou status ${response.status}`)
				return
			}
			const jogos = (await response.json()) as JogoExterno[]
			this.logger.log(`Encontrou ${jogos.length} jogos`)

			const partidas = await this.partidaService.findResultados()
			this.logger.log(`Encontrou ${partidas.length} partidas encerradas`)

			for (const jogo of jogos) {
				const placarTimeA = jogo.time1_gols ? Number.parseInt(jogo.time1_gols, 10) : undefined
				const placarTimeB = jogo.time2_gols ? Number.parseInt(jogo.time2_gols, 10) : undefined
				if (placarTimeA == null || placarTimeB == null || placarTimeA < 0 || placarTimeB < 0)
					continue

				const horarioJogo = parseISO(jogo.data)
				const partida = partidas.find(
					(p) =>
						p.timeA?.sigla === jogo.time1_nome_min &&
						p.timeB?.sigla === jogo.time2_nome_min &&
						isEqual(horarioJogo, p.data),
				)
				if (!partida) continue
				if (partida.placarTimeA === placarTimeA && partida.placarTimeB === placarTimeB) continue

				this.logger.log(
					`Atualizando partida ${partida.timeA?.sigla} ${partida.placarTimeA ?? '-'} x ` +
						`${partida.placarTimeB ?? '-'} ${partida.timeB?.sigla} → ${placarTimeA} x ${placarTimeB}`,
				)
				const partidaId = (partida._id as { toString(): string }).toString()
				await this.resultadoService.atualizarResultados(partidaId, { placarTimeA, placarTimeB })
			}

			this.logger.log(`Finalizou atualização dos resultados: ${new Date().toISOString()}`)
		} catch (err) {
			this.logger.error('Erro ao sincronizar resultados', err)
		}
	}
}
