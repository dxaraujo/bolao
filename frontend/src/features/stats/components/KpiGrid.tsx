import type { StatsOverview } from '@bolao/shared'
import { Crown, Goal, Sparkles, Target } from 'lucide-react'

import { Card } from '@/components/ui/card'

interface KpiGridProps {
	overview: StatsOverview
}

export function KpiGrid({ overview }: KpiGridProps) {
	const items = [
		{ icon: Goal, label: 'Total de jogos', value: overview.totalMatches, tone: 'text-acc' },
		{ icon: Target, label: 'Placares exatos', value: overview.totalExactBets, tone: 'text-green' },
		{ icon: Sparkles, label: 'Resultados certos', value: overview.totalCorrectBets, tone: 'text-gold' },
		{ icon: Crown, label: 'Líder', value: overview.leader?.name ?? '—', tone: 'text-purple' },
	]
	return (
		<div className="grid grid-cols-2 gap-2 md:grid-cols-4 md:gap-3">
			{items.map(({ icon: Icon, label, value, tone }) => (
				<Card key={label} className="animate-fade-up p-3 md:p-4">
					<Icon className={`h-5 w-5 ${tone}`} />
					<div className={`mt-2 font-display text-2xl leading-none md:text-3xl ${tone}`}>{value}</div>
					<div className="mt-1 text-[10px] uppercase tracking-wide text-sub">{label}</div>
				</Card>
			))}
		</div>
	)
}
