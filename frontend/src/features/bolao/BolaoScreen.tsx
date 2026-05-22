import { useEffect, useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { MatchStage, StageStatus } from '@bolao/shared'

import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { EmptyState } from '@/components/shared/EmptyState'
import { useAllBets } from '@/hooks/useBets'
import { useStages } from '@/hooks/useStages'
import { useMe } from '@/hooks/useMe'
import { STAGE_LABELS } from '@/lib/stage'

import { MatchAccordion } from './components/MatchAccordion'

export function BolaoScreen() {
	const { data: stages, isLoading: stagesLoading } = useStages()
	const { data: groups, isLoading: groupsLoading } = useAllBets()
	const { data: me } = useMe()

	const blockedStages = useMemo(
		() => (stages ?? []).filter((s) => s.status === StageStatus.BLOCKED),
		[stages],
	)

	const [tab, setTab] = useState<MatchStage | undefined>(undefined)

	useEffect(() => {
		if (!blockedStages.length) return
		if (tab && blockedStages.some((s) => s.matchStage === tab)) return
		setTab(blockedStages[0].matchStage)
	}, [blockedStages, tab])

	const filtered = useMemo(() => (groups ?? []).filter((g) => g.stage === tab), [groups, tab])

	if (stagesLoading || groupsLoading) {
		return (
			<div className="flex flex-col gap-3 p-4">
				<Skeleton className="h-10 w-full" />
				<Skeleton className="h-24 w-full" />
				<Skeleton className="h-24 w-full" />
			</div>
		)
	}

	if (blockedStages.length === 0) {
		return <EmptyState icon={Search} title="Nenhuma fase encerrada" description="Os palpites do grupo aparecem aqui após cada fase ser bloqueada." />
	}

	return (
		<div className="flex flex-col">
			<div className="border-b border-border bg-gradient-to-b from-surface to-background px-4 pt-3">
				<p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-sub">Palpites encerrados</p>
				<Tabs value={tab} onValueChange={(v) => setTab(v as MatchStage)}>
					<TabsList className="pb-3">
						{blockedStages.map((s) => {
							const count = (groups ?? []).filter((g) => g.stage === s.matchStage).length
							return (
								<TabsTrigger key={s.matchStage} value={s.matchStage}>
									{STAGE_LABELS[s.matchStage]?.short ?? s.matchStage}
									<span className="ml-1 rounded bg-muted px-1 text-[9px] font-bold text-muted-foreground">
										{count}
									</span>
								</TabsTrigger>
							)
						})}
					</TabsList>
				</Tabs>
			</div>

			<div className="px-4 py-3">
				{filtered.length === 0 ? (
					<EmptyState icon={Search} title="Nenhuma partida encerrada nesta fase" />
				) : (
					<MatchAccordion groups={filtered} currentUserId={me?._id} />
				)}
			</div>
		</div>
	)
}
