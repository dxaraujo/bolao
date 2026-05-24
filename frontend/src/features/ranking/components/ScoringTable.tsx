import { SCORING_RULES } from '@bolao/shared'

import { Card } from '@/components/ui/card'

export function ScoringTable() {
	const items: Array<{ label: string; points: number; tone: string }> = [
		{ label: 'Placar Exato', points: SCORING_RULES.exactScore, tone: 'text-green border-green/30 bg-green/10' },
		{ label: 'Time vencedor + Gol', points: SCORING_RULES.winnerWithGoal, tone: 'text-acc border-acc/30 bg-acc/10' },
		{ label: 'Somente o time vencedor', points: SCORING_RULES.correctWinner, tone: 'text-gold border-gold/30 bg-gold/10' },
		{ label: 'Gol', points: SCORING_RULES.oneGoalCorrect, tone: 'text-purple border-purple/30 bg-purple/10' },
	]

	return (
		<Card className="animate-fade-up p-3">
			<div className="mb-3 text-xs font-bold uppercase tracking-wider text-sub">Tabela de pontuação</div>
			<div className="grid grid-cols-2 gap-2">
				{items.map((i) => (
					<div key={i.label} className={`rounded-md border px-3 py-2 text-center ${i.tone}`}>
						<div className="font-display text-xl leading-none">+{i.points}</div>
						<div className="mt-1 text-xs font-semibold">{i.label}</div>
					</div>
				))}
			</div>
		</Card>
	)
}
