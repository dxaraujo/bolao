import { MatchStage } from '@bolao/shared'

export const STAGE_LABELS: Record<MatchStage, { full: string; short: string }> = {
	[MatchStage.GROUP_STAGE]: { full: 'Fase de Grupos', short: 'Grupos' },
	[MatchStage.LAST_32]: { full: 'Décima sexta de final', short: 'Décima sexta' },
	[MatchStage.LAST_16]: { full: 'Oitavas de Final', short: 'Oitavas' },
	[MatchStage.QUARTER_FINALS]: { full: 'Quartas de Final', short: 'Quartas' },
	[MatchStage.SEMI_FINALS]: { full: 'Semifinais', short: 'Semi' },
	[MatchStage.THIRD_PLACE]: { full: 'Disputa do 3º Lugar', short: '3º Lugar' },
	[MatchStage.FINAL]: { full: 'Final', short: 'Final' }
}

export function groupLabel(group: string | null | undefined): string {
	if (!group) return ''
	const match = group.match(/GROUP_([A-Z]+)/)
	if (match) return `Grupo ${match[1]}`
	return group
}

const STAGE_ORDER: MatchStage[] = [
	MatchStage.GROUP_STAGE,
	MatchStage.LAST_32,
	MatchStage.LAST_16,
	MatchStage.QUARTER_FINALS,
	MatchStage.SEMI_FINALS,
	MatchStage.THIRD_PLACE,
	MatchStage.FINAL
]

export function sortStages<T extends { matchStage: MatchStage }>(stages: T[]): T[] {
	return [...stages].sort((a, b) => {
		const ai = STAGE_ORDER.indexOf(a.matchStage)
		const bi = STAGE_ORDER.indexOf(b.matchStage)
		return (ai === -1 ? Infinity : ai) - (bi === -1 ? Infinity : bi)
	})
}
