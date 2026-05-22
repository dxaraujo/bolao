import type { ConfigPayload } from '@bolao/shared'

import { Card } from '@/components/ui/card'

interface ScoringTableProps {
	config: ConfigPayload
}

export function ScoringTable({ config }: ScoringTableProps) {
	const items: Array<{ label: string; points: number | string; tone: string }> = [
		{ label: 'Placar Exato', points: `+${config.pointsExactScore}`, tone: 'text-green border-green/30 bg-green/10' },
		{ label: 'Time vencedor + Gol', points: `+${config.pointsWinnerWithGoal}`, tone: 'text-acc border-acc/30 bg-acc/10' },
		{ label: 'Somente o time vencedor', points: `+${config.pointsCorrectWinner}`, tone: 'text-gold border-gold/30 bg-gold/10' },
		{ label: 'Gol', points: `+${config.pointsOneGoalCorrect}`, tone: 'text-purple border-purple/30 bg-purple/10' },
		{ label: 'Errou Tudo', points: '0', tone: 'text-red border-red/30 bg-red/10' },
	]

	return (
		<Card className="animate-fade-up p-3">
			<div className="mb-3 text-xs font-bold uppercase tracking-wider text-sub">Tabela de pontuação</div>
			<div className="grid grid-cols-2 gap-2">
				{items.map((i) => (
					<div key={i.label} className={`rounded-md border px-3 py-2 text-center ${i.tone}`}>
						<div className="font-display text-xl leading-none">{i.points}</div>
						<div className="mt-1 text-xs font-semibold">{i.label}</div>
					</div>
				))}
			</div>
		</Card>
	)
}
