import { Trophy } from 'lucide-react'

import { useMe } from '@/hooks/useMe'
import { useRanking } from '@/hooks/useRanking'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export function HeroPosition() {
	const { data: me } = useMe()
	const { data: ranking, isLoading } = useRanking()

	if (isLoading || !me) {
		return <Skeleton className="h-32 w-full rounded-lg" />
	}

	const total = ranking?.length ?? 0
	const position = me.ranking
	const medal = position === 1 ? '🥇' : position === 2 ? '🥈' : position === 3 ? '🥉' : `${position}°`

	return (
		<Card className="animate-fade-up relative overflow-hidden border-acc/30 bg-gradient-to-br from-acc/10 to-gold/5">
			<div className="px-4 pt-4">
				<div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-acc">
					<Trophy className="h-3 w-3" /> Sua posição atual
				</div>
				<div className="mt-3 flex items-center gap-4">
					<div className="font-display text-5xl leading-none">{medal}</div>
					<div>
						<div className="font-display text-4xl leading-none text-acc">
							{me.totalPointsEarned}
							<span className="ml-1 text-base text-sub">pts</span>
						</div>
						<div className="text-[11px] text-sub">de {total} participantes</div>
					</div>
				</div>
			</div>
			<div className="mt-3 flex gap-6 border-t border-border/50 px-4 py-3">
				<HeroStat value={me.exactScore} label="Placar exato" />
				<HeroStat value={me.correctWinner + me.winnerWithGoal + me.oneGoalCorrect} label="Resultados" />
				<HeroStat value={me.wrong} label="Erros" />
			</div>
		</Card>
	)
}

function HeroStat({ value, label }: { value: number; label: string }) {
	return (
		<div>
			<div className="font-display text-2xl leading-none">{value}</div>
			<div className="text-[9px] uppercase tracking-wide text-sub">{label}</div>
		</div>
	)
}
