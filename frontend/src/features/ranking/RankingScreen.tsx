import { Skeleton } from '@/components/ui/skeleton'
import { useLeaderboard } from '@/hooks/useLeaderboard'
import { useMe } from '@/hooks/useMe'

import { Podium } from './components/Podium'
import { RankingList } from './components/RankingList'
import { PointsChart } from './components/PointsChart'
import { ScoringTable } from './components/ScoringTable'

export function RankingScreen() {
	const { data: leaderboard, isLoading } = useLeaderboard()
	const { data: me } = useMe()

	if (isLoading || !leaderboard) {
		return (
			<div className="flex flex-col gap-3 p-4">
				<Skeleton className="h-40 w-full" />
				<Skeleton className="h-12 w-full" />
				<Skeleton className="h-12 w-full" />
			</div>
		)
	}

	const rows = leaderboard.rows

	return (
		<div className="flex flex-col gap-4 px-4 py-4">
			{me && !me.isActive && (
				<div className="rounded-lg border border-acc/30 bg-acc/10 px-4 py-3 text-sm text-acc">
					Você está acompanhando como espectador — não aparece no ranking.
				</div>
			)}
			<Podium leaders={rows} />
			<div className="grid gap-4 lg:grid-cols-2">
				<section className="flex flex-col gap-2">
					<h2 className="text-xs font-bold uppercase tracking-wider text-sub">Classificação completa</h2>
					<RankingList users={rows} currentUserId={me?._id} />
				</section>
				<div className="flex flex-col gap-4">
					<PointsChart users={rows} currentUserId={me?._id} />
					<ScoringTable />
				</div>
			</div>
		</div>
	)
}
