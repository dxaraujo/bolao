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
		<Card className="animate-fade-up relative overflow-hidden border-acc/30 bg-gradient-to-br from-acc/15 to-gold/10">
			<div
				className="pointer-events-none absolute -right-6 -top-6 h-32 w-32 rounded-full bg-acc/10 blur-xl"
				aria-hidden
			/>
			<div className="flex flex-col gap-2 px-4 pt-4">
				<div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-acc">
					<Trophy className="h-3 w-3" /> Sua posição atual
				</div>
				<div className="flex items-center justify-between mt-3 ml-2">
					<div className="font-display text-5xl leading-none">{medal}</div>
					<div className="flex flex-col items-center justify-center">
						<div className="text-xs text-sub">de {total} participantes</div>
					</div>
					<div className="flex font-display text-4xl leading-none text-acc ml-auto">
						{me.totalPointsEarned}
						<span className="ml-1 text-base text-sub">pts</span>
					</div>
				</div>
			</div>
			<div className="flex justify-between border-t border-acc/15 px-4 py-3">
				<HeroStat value={me.exactScore} label="Exato" tone="text-green" />
				<HeroStat value={me.winnerWithGoal} label="Venc+Gol" tone="text-acc" />
				<HeroStat value={me.correctWinner} label="Vencedor" tone="text-gold" />
				<HeroStat value={me.oneGoalCorrect} label="Gol" tone="text-purple" />
				<HeroStat value={me.wrong} label="Erros" tone="text-red" />
			</div>
		</Card>
	)
}

function HeroStat({ value, label, tone = 'text-main' }: { value: number; label: string; tone?: string }) {
	return (
		<div className="flex flex-col items-center">
			<div className={`font-display text-3xl leading-none ${tone}`}>{value}</div>
			<div className="text-[10px] uppercase tracking-wide text-sub text-center">{label}</div>
		</div>
	)
}
