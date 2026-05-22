import { Skeleton } from '@/components/ui/skeleton'

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

	return (
		<div className="flex flex-col gap-3 px-4 py-4">
			{overview ? <KpiGrid overview={overview} /> : <Skeleton className="h-32 w-full" />}
			{byUser ? <AccuracyByUser users={byUser} /> : <Skeleton className="h-32 w-full" />}
			{byStage ? <AccuracyByStageChart data={byStage} /> : <Skeleton className="h-48 w-full" />}
			{distribution ? <DistributionDonut data={distribution} /> : <Skeleton className="h-32 w-full" />}
		</div>
	)
}
