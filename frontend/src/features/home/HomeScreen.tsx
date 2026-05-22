import { useMemo } from 'react'
import { MatchStatus, type BetListItem } from '@bolao/shared'

import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/shared/EmptyState'
import { Goal } from 'lucide-react'

import { useMyBets } from '@/hooks/useBets'
import { useStages } from '@/hooks/useStages'

import { HeroPosition } from './components/HeroPosition'
import { OpenStageBanner } from './components/OpenStageBanner'
import { MatchCard } from './components/MatchCard'

const LIVE_STATUSES = new Set<MatchStatus>([MatchStatus.LIVE, MatchStatus.IN_PLAY, MatchStatus.PAUSED])
const UPCOMING_STATUSES = new Set<MatchStatus>([MatchStatus.TIMED, MatchStatus.SCHEDULED])

export function HomeScreen() {
	const { data: bets, isLoading: betsLoading } = useMyBets()
	const { data: stages } = useStages()

	const { live, upcoming, recent } = useMemo(() => {
		const empty = { live: [] as BetListItem[], upcoming: [] as BetListItem[], recent: [] as BetListItem[] }
		if (!bets) return empty

		const sortedAsc = [...bets].sort((a, b) => new Date(a.utcDate).getTime() - new Date(b.utcDate).getTime())
		const sortedDesc = [...bets].sort((a, b) => new Date(b.utcDate).getTime() - new Date(a.utcDate).getTime())

		const live = sortedAsc.filter((b) => LIVE_STATUSES.has(b.status))
		const upcoming = sortedAsc.filter((b) => UPCOMING_STATUSES.has(b.status)).slice(0, 6)
		const recent = sortedDesc.filter((b) => b.status === MatchStatus.FINISHED).slice(0, 4)
		return { live, upcoming, recent }
	}, [bets])

	return (
		<div className="flex flex-col gap-4 px-4 py-4">
			<HeroPosition />
			{stages && bets && <OpenStageBanner stages={stages} bets={bets} />}

			{live.length > 0 && (
				<Section title="Ao vivo">
					<div className="flex flex-col gap-2">
						{live.map((b) => (
							<MatchCard key={b._id} bet={b} />
						))}
					</div>
				</Section>
			)}

			<div className="grid gap-4 lg:grid-cols-2">
				<Section title="Próximos jogos">
					{betsLoading ? (
						<Skeleton className="h-24 w-full rounded-lg" />
					) : upcoming.length === 0 ? (
						<EmptyState icon={Goal} title="Nenhuma partida agendada" />
					) : (
						<div className="flex flex-col gap-2">
							{upcoming.map((b) => (
								<MatchCard key={b._id} bet={b} />
							))}
						</div>
					)}
				</Section>

				{recent.length > 0 && (
					<Section title="Resultados recentes">
						<div className="flex flex-col gap-2">
							{recent.map((b) => (
								<MatchCard key={b._id} bet={b} />
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
			<h2 className="text-xs font-bold uppercase tracking-wider text-sub">{title}</h2>
			{children}
		</section>
	)
}
