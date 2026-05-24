/**
 * Regras de pontuação e função pura `calculateBetScore`.
 *
 * Esta é a ÚNICA fonte de verdade para pontos. Backend e frontend importam daqui.
 */

import type { PointsEarned } from './enums.js'

export interface Score {
	home: number
	away: number
}

export interface BetScoreResult {
	exactScore: boolean
	winnerWithGoal: boolean
	correctWinner: boolean
	oneGoalCorrect: boolean
	wrong: boolean
	points: PointsEarned
}

export const SCORING_RULES = {
	exactScore: 5,
	winnerWithGoal: 3,
	correctWinner: 2,
	oneGoalCorrect: 1,
	wrong: 0,
} as const

const ZERO: BetScoreResult = {
	exactScore: false,
	winnerWithGoal: false,
	correctWinner: false,
	oneGoalCorrect: false,
	wrong: false,
	points: 0,
}

const isValid = (s?: Score | null): s is Score =>
	!!s && Number.isInteger(s.home) && Number.isInteger(s.away) && s.home >= 0 && s.away >= 0

const winnerOf = (s: Score): 'H' | 'A' | 'D' => (s.home > s.away ? 'H' : s.away > s.home ? 'A' : 'D')

/**
 * Calcula o resultado de um palpite contra o placar real.
 * Retorna `wrong: true / 0 pts` quando algum lado está ausente.
 */
export const calculateBetScore = (bet?: Score | null, match?: Score | null): BetScoreResult => {
	if (!isValid(bet) || !isValid(match)) return ZERO

	if (bet.home === match.home && bet.away === match.away) {
		return { ...ZERO, exactScore: true, points: SCORING_RULES.exactScore }
	}

	const bw = winnerOf(bet)
	const mw = winnerOf(match)
	const oneGoal = bet.home === match.home || bet.away === match.away

	if (bw === mw) {
		return oneGoal
			? { ...ZERO, winnerWithGoal: true, points: SCORING_RULES.winnerWithGoal }
			: { ...ZERO, correctWinner: true, points: SCORING_RULES.correctWinner }
	}

	return oneGoal
		? { ...ZERO, oneGoalCorrect: true, points: SCORING_RULES.oneGoalCorrect }
		: { ...ZERO, wrong: true, points: SCORING_RULES.wrong }
}

export interface LeaderboardBreakdown {
	exactScore: number
	winnerWithGoal: number
	correctWinner: number
	oneGoalCorrect: number
	wrong: number
}

export interface LeaderboardRow {
	user: string
	points: number
	breakdown: LeaderboardBreakdown
	rank: number
}

/**
 * Comparador para ordenação do leaderboard. Critério de desempate em ordem:
 * points → exactScore → winnerWithGoal → correctWinner → oneGoalCorrect.
 */
export const compareLeaderboardRows = (
	a: Pick<LeaderboardRow, 'points' | 'breakdown'>,
	b: Pick<LeaderboardRow, 'points' | 'breakdown'>,
): number =>
	b.points - a.points ||
	b.breakdown.exactScore - a.breakdown.exactScore ||
	b.breakdown.winnerWithGoal - a.breakdown.winnerWithGoal ||
	b.breakdown.correctWinner - a.breakdown.correctWinner ||
	b.breakdown.oneGoalCorrect - a.breakdown.oneGoalCorrect
