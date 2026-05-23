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

/** Ordem canônica das fases da competição. */
export const STAGE_ORDER: Record<MatchStage, number> = {
	[MatchStage.GROUP_STAGE]: 1,
	[MatchStage.LAST_32]: 2,
	[MatchStage.LAST_16]: 3,
	[MatchStage.QUARTER_FINALS]: 4,
	[MatchStage.SEMI_FINALS]: 5,
	[MatchStage.THIRD_PLACE]: 6,
	[MatchStage.FINAL]: 7,
}

/** Deadline fixo (UTC ISO-8601) para fechamento das apostas de cada fase. */
export const STAGE_DEADLINES: Record<MatchStage, string> = {
	[MatchStage.GROUP_STAGE]: '2026-06-11T15:00:00.000Z',
	[MatchStage.LAST_32]: '2026-06-28T15:00:00.000Z',
	[MatchStage.LAST_16]: '2026-07-04T16:00:00.000Z',
	[MatchStage.QUARTER_FINALS]: '2026-07-09T17:00:00.000Z',
	[MatchStage.SEMI_FINALS]: '2026-07-14T16:00:00.000Z',
	[MatchStage.THIRD_PLACE]: '2026-07-18T17:00:00.000Z',
	[MatchStage.FINAL]: '2026-07-19T15:00:00.000Z',
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
