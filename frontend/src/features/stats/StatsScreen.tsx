import { Skeleton } from '@/components/ui/skeleton'

import {
	useStatsAccuracyByUser,
	useStatsDistribution,
	useStatsOverview,
} from '@/hooks/useStats'

import { AccuracyByUser } from './components/AccuracyByUser'
import { DistributionDonut } from './components/DistributionDonut'
import { KpiGrid } from './components/KpiGrid'

export function StatsScreen() {
	const { data: overview } = useStatsOverview()
	const { data: byUser } = useStatsAccuracyByUser()
	const { data: distribution } = useStatsDistribution()

	return (
		<div className="flex flex-col gap-3 px-4 py-4">
			{overview ? <KpiGrid overview={overview} /> : <Skeleton className="h-32 w-full" />}
			<div className="grid gap-3 md:grid-cols-2">
				{byUser ? <AccuracyByUser users={byUser} /> : <Skeleton className="h-32 w-full" />}
				{distribution ? <DistributionDonut data={distribution} /> : <Skeleton className="h-32 w-full" />}
			</div>
		</div>
	)
}
