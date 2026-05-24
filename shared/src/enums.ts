/**
 * Enums de domínio compartilhados entre backend e frontend.
 */

/** Fase da competição. */
export enum MatchStage {
	GROUP_STAGE = 'GROUP_STAGE',
	LAST_32 = 'LAST_32',
	LAST_16 = 'LAST_16',
	QUARTER_FINALS = 'QUARTER_FINALS',
	SEMI_FINALS = 'SEMI_FINALS',
	THIRD_PLACE = 'THIRD_PLACE',
	FINAL = 'FINAL',
}

/** Estado derivado de uma fase (computado por getStageState). */
export enum StageState {
	LOCKED = 'LOCKED',
	OPEN = 'OPEN',
	CLOSED = 'CLOSED',
}

/** Status interno de uma partida (reduzido para 4 valores). */
export enum MatchStatus {
	SCHEDULED = 'SCHEDULED',
	LIVE = 'LIVE',
	FINISHED = 'FINISHED',
	CANCELLED = 'CANCELLED',
}

/** Ordem canônica das fases (1..7). */
export const STAGE_ORDER: Record<MatchStage, number> = {
	[MatchStage.GROUP_STAGE]: 1,
	[MatchStage.LAST_32]: 2,
	[MatchStage.LAST_16]: 3,
	[MatchStage.QUARTER_FINALS]: 4,
	[MatchStage.SEMI_FINALS]: 5,
	[MatchStage.THIRD_PLACE]: 6,
	[MatchStage.FINAL]: 7,
}

/** Deadline canônico (UTC ISO-8601) para encerramento das apostas — Copa 2026. */
export const STAGE_DEADLINES: Record<MatchStage, string> = {
	[MatchStage.GROUP_STAGE]: '2026-06-11T15:00:00.000Z',
	[MatchStage.LAST_32]: '2026-06-28T15:00:00.000Z',
	[MatchStage.LAST_16]: '2026-07-04T16:00:00.000Z',
	[MatchStage.QUARTER_FINALS]: '2026-07-09T17:00:00.000Z',
	[MatchStage.SEMI_FINALS]: '2026-07-14T16:00:00.000Z',
	[MatchStage.THIRD_PLACE]: '2026-07-18T17:00:00.000Z',
	[MatchStage.FINAL]: '2026-07-19T15:00:00.000Z',
}

/** Quantidade esperada de partidas por fase — Copa 2026 (48 seleções). */
export const STAGE_EXPECTED_MATCHES: Record<MatchStage, number> = {
	[MatchStage.GROUP_STAGE]: 72,
	[MatchStage.LAST_32]: 16,
	[MatchStage.LAST_16]: 8,
	[MatchStage.QUARTER_FINALS]: 4,
	[MatchStage.SEMI_FINALS]: 2,
	[MatchStage.THIRD_PLACE]: 1,
	[MatchStage.FINAL]: 1,
}

/** Fase predecessora obrigatória (override do "anterior por ordem"). */
export const STAGE_PREDECESSOR: Record<MatchStage, MatchStage | undefined> = {
	[MatchStage.GROUP_STAGE]: undefined,
	[MatchStage.LAST_32]: MatchStage.GROUP_STAGE,
	[MatchStage.LAST_16]: MatchStage.LAST_32,
	[MatchStage.QUARTER_FINALS]: MatchStage.LAST_16,
	[MatchStage.SEMI_FINALS]: MatchStage.QUARTER_FINALS,
	[MatchStage.THIRD_PLACE]: MatchStage.SEMI_FINALS,
	[MatchStage.FINAL]: MatchStage.SEMI_FINALS,
}

/** Valores válidos de pontuação. */
export const VALID_POINTS = [0, 1, 2, 3, 5] as const
export type PointsEarned = (typeof VALID_POINTS)[number]

/** Cap máximo de gols num palpite (defensivo). */
export const MAX_GOALS = 20
