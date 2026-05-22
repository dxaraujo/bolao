import { Skeleton } from '@/components/ui/skeleton'
import { useRanking } from '@/hooks/useRanking'
import { useMe } from '@/hooks/useMe'

import {
	useStatsAccuracyByStage,
	useStatsAccuracyByUser,
	useStatsDistribution,
	useStatsOverview,
} from '@/hooks/useStats'

import { AccuracyByStageChart } from './components/AccuracyByStageChart'
import { AccuracyByUser } from './components/AccuracyByUser'
import { DistributionDonut } from './components/DistributionDonut'
import { KpiGrid } from './components/KpiGrid'

export function StatsScreen() {
	const { data: overview } = useStatsOverview()
	const { data: byUser } = useStatsAccuracyByUser()
	const { data: byStage } = useStatsAccuracyByStage()
	const { data: distribution } = useStatsDistribution()
	const { data: ranking } = useRanking()
	const { data: me } = useMe()

	return (
		<div className="flex flex-col gap-3 px-4 py-4">
			{overview ? <KpiGrid overview={overview} /> : <Skeleton className="h-32 w-full" />}
			<div className="grid gap-3 md:grid-cols-2">
				{byUser ? <AccuracyByUser users={byUser} /> : <Skeleton className="h-32 w-full" />}
				{distribution ? <DistributionDonut data={distribution} /> : <Skeleton className="h-32 w-full" />}
			</div>
			{byStage ? (
				<AccuracyByStageChart data={byStage} ranking={ranking} currentUserId={me?._id} />
			) : (
				<Skeleton className="h-48 w-full" />
			)}
		</div>
	)
}
