import { SCORING_RULES } from '@bolao/shared'
import { CircleDot, Goal, Target, Trophy, X, type LucideIcon } from 'lucide-react'

import { Card } from '@/components/ui/card'
import { cn } from '@/lib/cn'

type Row = {
	label: string
	points: number
	icon: LucideIcon
	value: string
}

const ROWS: Row[] = [
	{ label: 'Placar exato', points: SCORING_RULES.exactScore, icon: Trophy, value: 'text-green' },
	{ label: 'Vencedor + um gol', points: SCORING_RULES.winnerWithGoal, icon: Goal, value: 'text-acc' },
	{ label: 'Somente o vencedor', points: SCORING_RULES.correctWinner, icon: Target, value: 'text-gold' },
	{ label: 'Acertou um gol', points: SCORING_RULES.oneGoalCorrect, icon: CircleDot, value: 'text-purple' },
	{ label: 'Errou tudo', points: SCORING_RULES.wrong, icon: X, value: 'text-red' },
]

export function ScoringTable() {
	return (
		<Card className="animate-fade-up overflow-hidden p-0">
			<div className="px-4 pt-4 pb-2 text-xs font-bold uppercase tracking-wider text-sub">Tabela de pontuação</div>
			<ul className="divide-y divide-border/60">
				{ROWS.map((row) => {
					const Icon = row.icon
					return (
					<li key={row.label} className="flex items-center gap-3 px-4 py-2.5">
						<Icon className={cn('h-4 w-4 shrink-0', row.value)} aria-hidden />
						<span className="flex-1 text-sm font-medium">{row.label}</span>
						<span className={cn('font-display text-lg leading-none tabular-nums', row.value)}>
							{row.points > 0 ? `+${row.points}` : row.points}
							<span className="ml-1 text-[11px] uppercase tracking-wide text-sub">{row.points === 1 ? 'pt' : 'pts'}</span>
						</span>
					</li>
					)
				})}
			</ul>
		</Card>
	)
}
