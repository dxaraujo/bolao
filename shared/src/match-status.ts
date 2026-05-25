/**
 * De-para de status externo (Football Data) → status interno (4 valores)
 * e workflow de transições canônicas vs alertáveis.
 */

import { MatchStatus } from './enums.js'

/** Status reportados pela Football Data API. */
export const EXTERNAL_STATUSES = ['TIMED', 'SCHEDULED', 'POSTPONED', 'IN_PLAY', 'PAUSED', 'FINISHED', 'AWARDED', 'CANCELLED', 'SUSPENDED'] as const

export type ExternalMatchStatus = (typeof EXTERNAL_STATUSES)[number]

/**
 * Mapeia status externo para os 4 internos.
 * Desconhecidos caem em SCHEDULED (defensivo) e devem gerar log.
 */
export const mapExternalStatus = (external: string): MatchStatus => {
	switch (external) {
		case 'TIMED':
		case 'SCHEDULED':
		case 'POSTPONED':
			return MatchStatus.SCHEDULED
		case 'IN_PLAY':
		case 'PAUSED':
			return MatchStatus.LIVE
		case 'FINISHED':
		case 'AWARDED':
			return MatchStatus.FINISHED
		case 'CANCELLED':
		case 'SUSPENDED':
			return MatchStatus.CANCELLED
		default:
			return MatchStatus.SCHEDULED
	}
}

/**
 * Transições canônicas (esperadas). Tudo fora disso (e ≠ identidade) é "não-canônico"
 * — aceitamos mas logamos warning.
 */
export const CANONICAL_TRANSITIONS: Record<MatchStatus, MatchStatus[]> = {
	[MatchStatus.SCHEDULED]: [MatchStatus.LIVE, MatchStatus.FINISHED, MatchStatus.CANCELLED],
	[MatchStatus.LIVE]: [MatchStatus.FINISHED, MatchStatus.CANCELLED],
	[MatchStatus.FINISHED]: [],
	[MatchStatus.CANCELLED]: [],
}

export const isCanonicalTransition = (from: MatchStatus, to: MatchStatus): boolean => from === to || CANONICAL_TRANSITIONS[from].includes(to)
