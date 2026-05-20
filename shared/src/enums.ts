/**
 * Enums de domínio compartilhados entre backend e frontend.
 */

export enum PhaseStatus {
	DISABLED = 0,
	OPEN = 1,
	BLOCKED = 2,
}

/** Pontuações válidas para um palpite, conforme regra do bolão. */
export const PONTOS_VALIDOS = [0, 1, 2, 3, 5] as const
export type PontosObtidos = (typeof PONTOS_VALIDOS)[number]
