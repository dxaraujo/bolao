/**
 * Enums de domínio compartilhados entre backend e frontend.
 */

export enum StageStatus {
	DISABLED = 'DISABLED',
	OPEN = 'OPEN',
	BLOCKED = 'BLOCKED',
}

/** Fase da competição conforme Football Data API. */
export enum MatchStage {
	GROUP_STAGE = 'GROUP_STAGE',
	LAST_32 = 'LAST_32',
	LAST_16 = 'LAST_16',
	QUARTER_FINALS = 'QUARTER_FINALS',
	SEMI_FINALS = 'SEMI_FINALS',
	THIRD_PLACE = 'THIRD_PLACE',
	FINAL = 'FINAL'
}

/** Status de partida conforme Football Data API. */
export enum MatchStatus {
	TIMED = 'TIMED',
	SCHEDULED = 'SCHEDULED',
	LIVE = 'LIVE',
	IN_PLAY = 'IN_PLAY',
	PAUSED = 'PAUSED',
	FINISHED = 'FINISHED',
	POSTPONED = 'POSTPONED',
	SUSPENDED = 'SUSPENDED',
	CANCELLED = 'CANCELLED',
}

/** Valid points for a bet, according to the pool rules. */
export const VALID_POINTS = [0, 1, 2, 3, 5] as const
export type PointsEarned = (typeof VALID_POINTS)[number]
