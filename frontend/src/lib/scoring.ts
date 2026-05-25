import { SCORING_RULES, type BetResult } from '@bolao/shared'
import { CircleDot, Clock, Goal, Target, Trophy, X, type LucideIcon } from 'lucide-react'

export type ResultKind = 'exact' | 'winnerWithGoal' | 'oneGoalCorrect' | 'correctWinner' | 'wrong' | 'pending'

export function resultKindOf(result?: BetResult | null): ResultKind {
	if (!result) return 'pending'
	if (result.exactScore) return 'exact'
	if (result.winnerWithGoal) return 'winnerWithGoal'
	if (result.oneGoalCorrect) return 'oneGoalCorrect'
	if (result.correctWinner) return 'correctWinner'
	if (result.wrong) return 'wrong'
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
	winnerWithGoal: 'acc',
	oneGoalCorrect: 'purple',
	correctWinner: 'gold',
	wrong: 'red',
	pending: 'sub',
}

export const RESULT_ICON: Record<ResultKind, LucideIcon> = {
	exact: Trophy,
	winnerWithGoal: Goal,
	oneGoalCorrect: CircleDot,
	correctWinner: Target,
	wrong: X,
	pending: Clock,
}

export function pointsFor(kind: ResultKind): number {
	switch (kind) {
		case 'exact':
			return SCORING_RULES.exactScore
		case 'winnerWithGoal':
			return SCORING_RULES.winnerWithGoal
		case 'oneGoalCorrect':
			return SCORING_RULES.oneGoalCorrect
		case 'correctWinner':
			return SCORING_RULES.correctWinner
		default:
			return 0
	}
}
