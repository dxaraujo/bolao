import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { MatchStage, StageState } from '@bolao/shared'

import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { EmptyState } from '@/components/shared/EmptyState'
import { useAllBets } from '@/hooks/useBets'
import { useStages } from '@/hooks/useStages'
import { useMe } from '@/hooks/useMe'
import { STAGE_LABELS, groupLabel } from '@/lib/stage'

import { MatchAccordion } from './components/MatchAccordion'

export function BolaoScreen() {
	const { data: stages, isLoading: stagesLoading } = useStages()
	const { data: groups, isLoading: groupsLoading } = useAllBets()
	const { data: me } = useMe()

	const closedStages = useMemo(
		() => (stages ?? []).filter((s) => s.state === StageState.CLOSED),
		[stages],
	)

	const [tab, setTab] = useState<MatchStage | null>(null)

	const activeTab = useMemo(() => {
		if (!closedStages.length) return null
		if (tab && closedStages.some((s) => s.code === tab)) return tab
		return closedStages[0].code
	}, [closedStages, tab])

	const filtered = useMemo(() => (groups ?? []).filter((g) => g.match.stage === activeTab), [groups, activeTab])

	const groupedMatches = useMemo(() => {
		if (!filtered.length) return null
		if (!filtered.some((m) => m.match.group)) return null
		const map = new Map<string, typeof filtered>()
		for (const m of filtered) {
			const key = m.match.group ?? ''
			if (!map.has(key)) map.set(key, [])
			map.get(key)!.push(m)
		}
		return map
	}, [filtered])

	if (stagesLoading || groupsLoading) {
		return (
			<div className="flex flex-col gap-3 p-4">
				<Skeleton className="h-10 w-full" />
				<Skeleton className="h-24 w-full" />
				<Skeleton className="h-24 w-full" />
			</div>
		)
	}

	if (closedStages.length === 0) {
		return (
			<EmptyState
				icon={Search}
				title="Nenhuma fase encerrada"
				description="As apostas do grupo aparecem aqui após cada fase ser encerrada."
			/>
		)
	}

	return (
		<div className="flex flex-col">
			<div className="border-b border-border bg-gradient-to-b from-surface to-background px-4 pt-3">
				<p className="mb-2 text-xs font-bold uppercase tracking-wider text-sub">Apostas encerradas</p>
				{activeTab && (
					<Tabs value={activeTab} onValueChange={(v) => setTab(v as MatchStage)}>
						<TabsList className="pb-3">
							{closedStages.map((s) => {
								const count = (groups ?? []).filter((g) => g.match.stage === s.code).length
								return (
									<TabsTrigger key={s.code} value={s.code}>
										{STAGE_LABELS[s.code]?.short ?? s.code}
										<span className="ml-1 rounded bg-muted px-1 text-[11px] font-bold text-muted-foreground">
											{count}
										</span>
									</TabsTrigger>
								)
							})}
						</TabsList>
					</Tabs>
				)}
			</div>

			<div className="px-4 py-3">
				{filtered.length === 0 ? (
					<EmptyState icon={Search} title="Nenhuma partida encerrada nesta fase" />
				) : groupedMatches ? (
					Array.from(groupedMatches.entries()).map(([group, matches]) => (
						<div key={group}>
							<p className="mb-2 mt-4 text-xs font-bold uppercase tracking-widest text-sub first:mt-0">
								{groupLabel(group)}
							</p>
							<MatchAccordion groups={matches} currentUserId={me?._id} />
						</div>
					))
				) : (
					<MatchAccordion groups={filtered} currentUserId={me?._id} />
				)}
			</div>
		</div>
	)
}
