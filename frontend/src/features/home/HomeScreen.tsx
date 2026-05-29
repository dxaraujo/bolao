import { useMemo } from 'react'
import { MatchStatus, type MyBetItem } from '@bolao/shared'

import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/shared/EmptyState'
import { Goal } from 'lucide-react'

import { useMyBets } from '@/hooks/useBets'
import { useStages } from '@/hooks/useStages'

import { HeroPosition } from './components/HeroPosition'
import { OpenStageBanner } from './components/OpenStageBanner'
import { MatchCard } from './components/MatchCard'
import { UpcomingMatchCard } from './components/UpcomingMatchCard'

export function HomeScreen() {
	const { data: bets, isLoading: betsLoading } = useMyBets()
	const { data: stages } = useStages()

	const { live, upcoming, recent } = useMemo(() => {
		const empty = { live: [] as MyBetItem[], upcoming: [] as MyBetItem[], recent: [] as MyBetItem[] }
		if (!bets) return empty

		const sortedAsc = [...bets].sort((a, b) => new Date(a.match.utcDate).getTime() - new Date(b.match.utcDate).getTime())
		const sortedDesc = [...bets].sort((a, b) => new Date(b.match.utcDate).getTime() - new Date(a.match.utcDate).getTime())

		const live = sortedAsc.filter((b) => b.match.status === MatchStatus.LIVE)

		const upcomingAll = sortedAsc.filter((b) => b.match.status === MatchStatus.SCHEDULED)
		let upcoming: MyBetItem[] = []
		if (upcomingAll.length > 0) {
			const firstBetDay = new Date(upcomingAll[0].match.utcDate)
			firstBetDay.setHours(0, 0, 0, 0)
			const todayStart = new Date()
			todayStart.setHours(0, 0, 0, 0)
			const windowStart = firstBetDay.getTime() <= todayStart.getTime() ? todayStart : firstBetDay
			const windowEnd = new Date(windowStart)
			windowEnd.setDate(windowEnd.getDate() + 2)
			upcoming = upcomingAll.filter((b) => {
				const d = new Date(b.match.utcDate)
				return d.getTime() >= windowStart.getTime() && d.getTime() < windowEnd.getTime()
			})
		}

		const recent = sortedDesc.filter((b) => b.match.status === MatchStatus.FINISHED).slice(0, 4)
		return { live, upcoming, recent }
	}, [bets])

	return (
		<div className="flex flex-col gap-4 px-4 py-4">
			<HeroPosition />
			{stages && bets && <OpenStageBanner stages={stages} bets={bets} />}

			{live.length > 0 && (
				<Section title="Ao vivo">
					<div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
						{live.map((b) => (
							<MatchCard key={b.match._id} item={b} />
						))}
					</div>
				</Section>
			)}

			<Section title="Próximos jogos">
				{betsLoading ? (
					<Skeleton className="h-24 w-full rounded-lg" />
				) : upcoming.length === 0 ? (
					<EmptyState icon={Goal} title="Nenhum jogo futuro agendado" />
				) : (
					<div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
						{upcoming.map((b) => (
							<UpcomingMatchCard key={b.match._id} item={b} />
						))}
					</div>
				)}
			</Section>

			{recent.length > 0 && (
				<Section title="Resultados recentes">
					<div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
						{recent.map((b) => (
							<MatchCard key={b.match._id} item={b} />
						))}
					</div>
				</Section>
			)}
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
