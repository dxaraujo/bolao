import type { GroupedBetItem, ConfigPayload } from '@bolao/shared'

export type ResultKind = 'exact' | 'winnerWithGoal' | 'oneGoalCorrect' | 'correctWinner' | 'wrong' | 'pending'

export function resultOf(bet: GroupedBetItem): ResultKind {
	if (bet.exactScore) return 'exact'
	if (bet.winnerWithGoal) return 'winnerWithGoal'
	if (bet.oneGoalCorrect) return 'oneGoalCorrect'
	if (bet.correctWinner) return 'correctWinner'
	if (bet.wrong) return 'wrong'
	return 'pending'
}

export const RESULT_LABEL: Record<ResultKind, string> = {
	exact: 'Exato',
	winnerWithGoal: 'Vencedor + gol',
	oneGoalCorrect: 'Acertou um gol',
	correctWinner: 'Vencedor',
	wrong: 'Errou',
	pending: '—',
}

export const RESULT_TONE: Record<ResultKind, 'green' | 'gold' | 'acc' | 'purple' | 'red' | 'sub'> = {
	exact: 'green',
	winnerWithGoal: 'gold',
	oneGoalCorrect: 'acc',
	correctWinner: 'purple',
	wrong: 'red',
	pending: 'sub',
}

export function pointsFor(kind: ResultKind, config: ConfigPayload | undefined): number {
	if (!config) return 0
	switch (kind) {
		case 'exact':
			return config.pointsExactScore
		case 'winnerWithGoal':
			return config.pointsWinnerWithGoal
		case 'oneGoalCorrect':
			return config.pointsOneGoalCorrect
		case 'correctWinner':
			return config.pointsCorrectWinner
		default:
			return 0
	}
}
