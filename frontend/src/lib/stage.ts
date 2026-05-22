import { MatchStage } from '@bolao/shared'

export const STAGE_LABELS: Record<MatchStage, { full: string; short: string }> = {
	[MatchStage.ROUND_1]: { full: 'Rodada 1', short: 'R1' },
	[MatchStage.GROUP_STAGE]: { full: 'Fase de Grupos', short: 'Grupos' },
	[MatchStage.LAST_16]: { full: 'Oitavas de Final', short: 'Oitavas' },
	[MatchStage.QUARTER_FINALS]: { full: 'Quartas de Final', short: 'Quartas' },
	[MatchStage.SEMI_FINALS]: { full: 'Semifinais', short: 'Semi' },
	[MatchStage.THIRD_PLACE]: { full: 'Disputa do 3º Lugar', short: '3º Lugar' },
	[MatchStage.FINAL]: { full: 'Final', short: 'Final' },
	[MatchStage.LAST_32]: { full: '32-avos', short: '32-avos' },
	[MatchStage.LAST_64]: { full: '64-avos', short: '64-avos' },
	[MatchStage.PRELIMINARY_ROUND]: { full: 'Preliminar', short: 'Prelim.' },
	[MatchStage.QUALIFICATION]: { full: 'Qualificação', short: 'Qualif.' },
	[MatchStage.QUALIFICATION_ROUND_1]: { full: 'Qualif. 1', short: 'Q1' },
	[MatchStage.QUALIFICATION_ROUND_2]: { full: 'Qualif. 2', short: 'Q2' },
	[MatchStage.QUALIFICATION_ROUND_3]: { full: 'Qualif. 3', short: 'Q3' },
	[MatchStage.PLAYOFF_ROUND_1]: { full: 'Playoff 1', short: 'P1' },
	[MatchStage.PLAYOFF_ROUND_2]: { full: 'Playoff 2', short: 'P2' },
	[MatchStage.PLAYOFFS]: { full: 'Playoffs', short: 'Playoffs' },
	[MatchStage.ROUND_2]: { full: 'Rodada 2', short: 'R2' },
	[MatchStage.ROUND_3]: { full: 'Rodada 3', short: 'R3' },
	[MatchStage.ROUND_4]: { full: 'Rodada 4', short: 'R4' },
	[MatchStage.REGULAR_SEASON]: { full: 'Temporada', short: 'Reg.' },
	[MatchStage.APERTURA]: { full: 'Apertura', short: 'Apert.' },
	[MatchStage.CLAUSURA]: { full: 'Clausura', short: 'Claus.' },
	[MatchStage.CHAMPIONSHIP]: { full: 'Campeonato', short: 'Camp.' },
	[MatchStage.RELEGATION]: { full: 'Rebaixamento', short: 'Rebaix.' },
	[MatchStage.RELEGATION_ROUND]: { full: 'Rebaix.', short: 'Rebaix.' },
}

const STAGE_ORDER: MatchStage[] = [
	MatchStage.GROUP_STAGE,
	MatchStage.LAST_16,
	MatchStage.QUARTER_FINALS,
	MatchStage.SEMI_FINALS,
	MatchStage.THIRD_PLACE,
	MatchStage.FINAL,
]

export function sortStages<T extends { matchStage: MatchStage }>(stages: T[]): T[] {
	return [...stages].sort((a, b) => {
		const ai = STAGE_ORDER.indexOf(a.matchStage)
		const bi = STAGE_ORDER.indexOf(b.matchStage)
		return (ai === -1 ? Infinity : ai) - (bi === -1 ? Infinity : bi)
	})
}
