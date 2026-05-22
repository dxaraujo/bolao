import { Skeleton } from '@/components/ui/skeleton'
import { useRanking } from '@/hooks/useRanking'
import { useConfig } from '@/hooks/useConfig'
import { useMe } from '@/hooks/useMe'

import { Podium } from './components/Podium'
import { RankingList } from './components/RankingList'
import { PointsChart } from './components/PointsChart'
import { ScoringTable } from './components/ScoringTable'

export function RankingScreen() {
	const { data: ranking, isLoading } = useRanking()
	const { data: config } = useConfig()
	const { data: me } = useMe()

	if (isLoading || !ranking) {
		return (
			<div className="flex flex-col gap-3 p-4">
				<Skeleton className="h-40 w-full" />
				<Skeleton className="h-12 w-full" />
				<Skeleton className="h-12 w-full" />
			</div>
		)
	}

	return (
		<div className="flex flex-col gap-4 px-4 py-4">
			<Podium leaders={ranking.slice(0, 3)} />
			<section className="flex flex-col gap-2">
				<h2 className="text-[11px] font-bold uppercase tracking-wider text-sub">Classificação completa</h2>
				<RankingList users={ranking} currentUserId={me?._id} />
			</section>
			<PointsChart users={ranking} />
			{config && <ScoringTable config={config} />}
		</div>
	)
}
