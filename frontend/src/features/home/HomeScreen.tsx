import { useMemo } from 'react'
import { MatchStatus, StageStatus } from '@bolao/shared'

import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/shared/EmptyState'
import { Goal } from 'lucide-react'

import { useMatches } from '@/hooks/useMatches'
import { useStages } from '@/hooks/useStages'

import { HeroPosition } from './components/HeroPosition'
import { OpenStageBanner } from './components/OpenStageBanner'
import { MatchCard } from './components/MatchCard'

export function HomeScreen() {
	const { data: matches, isLoading: matchesLoading } = useMatches()
	const { data: stages, isLoading: stagesLoading } = useStages()

	const { upcoming, recent } = useMemo(() => {
		if (!matches || !stages) return { upcoming: [], recent: [] }
		const openStage = stages.find((s) => s.status === StageStatus.OPEN)
		const blocked = stages.filter((s) => s.status === StageStatus.BLOCKED).map((s) => s.matchStage)

		const upcoming = matches
			.filter((m) => (openStage ? m.stage === openStage.matchStage : false))
			.sort((a, b) => new Date(a.utcDate).getTime() - new Date(b.utcDate).getTime())
		const recent = matches
			.filter((m) => blocked.includes(m.stage) && m.status === MatchStatus.FINISHED)
			.sort((a, b) => new Date(b.utcDate).getTime() - new Date(a.utcDate).getTime())
			.slice(0, 4)

		return { upcoming, recent }
	}, [matches, stages])

	const isLoading = matchesLoading || stagesLoading

	return (
		<div className="flex flex-col gap-4 px-4 py-4">
			<HeroPosition />
			{stages && matches && <OpenStageBanner stages={stages} matches={matches} />}

			<div className="grid gap-4 lg:grid-cols-2">
				<Section title="Próximos jogos">
					{isLoading ? (
						<Skeleton className="h-24 w-full rounded-lg" />
					) : upcoming.length === 0 ? (
						<EmptyState icon={Goal} title="Nenhuma fase aberta no momento" />
					) : (
						<div className="flex flex-col gap-2">
							{upcoming.map((m) => (
								<MatchCard key={m._id} match={m} />
							))}
						</div>
					)}
				</Section>

				{recent.length > 0 && (
					<Section title="Resultados recentes">
						<div className="flex flex-col gap-2">
							{recent.map((m) => (
								<MatchCard key={m._id} match={m} />
							))}
						</div>
					</Section>
				)}
			</div>
		</div>
	)
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
	return (
		<section className="flex flex-col gap-2">
			<h2 className="text-[11px] font-bold uppercase tracking-wider text-sub">{title}</h2>
			{children}
		</section>
	)
}
