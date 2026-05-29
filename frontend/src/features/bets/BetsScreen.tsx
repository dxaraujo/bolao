import { useEffect, useMemo, useState } from 'react'
import { Lock, Save, Target, CalendarClock } from 'lucide-react'
import { toast } from 'sonner'
import { MatchStage, MatchStatus, SCORING_RULES, StageState, type BetSubmitItem } from '@bolao/shared'

import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { EmptyState } from '@/components/shared/EmptyState'
import { StageBadge } from '@/components/shared/StageBadge'
import { cn } from '@/lib/cn'

import { useMyBets, useSubmitBets } from '@/hooks/useBets'
import { useStages } from '@/hooks/useStages'
import { STAGE_LABELS, groupLabel } from '@/lib/stage'
import { formatDeadline } from '@/lib/format'

import { BetCard, type BetDraft } from './components/BetCard'

const emptyDraft: BetDraft = { home: '', away: '' }

export function BetsScreen() {
	const { data: stages, isLoading: stagesLoading } = useStages()
	const { data: bets, isLoading: betsLoading } = useMyBets()
	const submit = useSubmitBets()

	const [tab, setTab] = useState<MatchStage | null>(null)
	const [draft, setDraft] = useState<Record<string, BetDraft>>({})

	const activeTab = useMemo(() => {
		if (!stages?.length) return null
		if (tab && stages.some((s) => s.code === tab)) return tab
		const open = stages.find((s) => s.state === StageState.OPEN)
		return (open ?? stages[0]).code
	}, [stages, tab])

	useEffect(() => {
		if (!bets) return
		setDraft((current) => {
			const next: Record<string, BetDraft> = { ...current }
			for (const item of bets) {
				if (!(item.match._id in next)) {
					next[item.match._id] = {
						home: item.bet?.score.home != null ? String(item.bet.score.home) : '',
						away: item.bet?.score.away != null ? String(item.bet.score.away) : '',
					}
				}
			}
			return next
		})
	}, [bets])

	const currentStage = stages?.find((s) => s.code === activeTab)
	const isOpen = currentStage?.state === StageState.OPEN

	const stageItems = useMemo(() => {
		if (!bets || !currentStage) return []
		return bets
			.filter((b) => b.match.stage === currentStage.code)
			.sort((a, b) => {
				const groupCmp = (a.match.group ?? '').localeCompare(b.match.group ?? '')
				if (groupCmp !== 0) return groupCmp
				const dateCmp = new Date(a.match.utcDate).getTime() - new Date(b.match.utcDate).getTime()
				if (dateCmp !== 0) return dateCmp
				return a.match.homeTeam.tla.localeCompare(b.match.homeTeam.tla)
			})
	}, [bets, currentStage])

	const groupedItems = useMemo(() => {
		if (!stageItems.length) return null
		if (!stageItems.some((b) => b.match.group)) return null
		const map = new Map<string, typeof stageItems>()
		for (const item of stageItems) {
			const key = item.match.group ?? ''
			if (!map.has(key)) map.set(key, [])
			map.get(key)!.push(item)
		}
		return new Map([...map.entries()].sort(([a], [b]) => a.localeCompare(b)))
	}, [stageItems])

	const filled = useMemo(() => {
		if (!isOpen) return 0
		return stageItems.filter((item) => {
			const d = draft[item.match._id] ?? emptyDraft
			return d.home !== '' && d.away !== ''
		}).length
	}, [draft, stageItems, isOpen])

	async function handleSave() {
		const items: BetSubmitItem[] = []
		for (const item of stageItems) {
			const d = draft[item.match._id] ?? emptyDraft
			if (d.home === '' || d.away === '') continue
			items.push({ matchId: item.match._id, score: { home: Number(d.home), away: Number(d.away) } })
		}

		if (items.length === 0) {
			toast.error('Preencha pelo menos um palpite (placar completo)')
			return
		}

		try {
			const r = await submit.mutateAsync(items)
			toast.success(`${r.upserted} palpite${r.upserted === 1 ? '' : 's'} salvo${r.upserted === 1 ? '' : 's'}`)
		} catch (e) {
			toast.error(e instanceof Error ? e.message : 'Falha ao salvar palpites')
		}
	}

	if (stagesLoading || betsLoading || !stages?.length) {
		return (
			<div className="flex flex-col gap-3 p-4">
				<Skeleton className="h-10 w-full" />
				<Skeleton className="h-24 w-full" />
				<Skeleton className="h-24 w-full" />
			</div>
		)
	}

	return (
		<div className="flex flex-1 flex-col">
			<div className="border-b border-border bg-gradient-to-b from-surface to-background px-4 pt-3">
				{activeTab && (
					<Tabs value={activeTab} onValueChange={(v) => setTab(v as MatchStage)}>
						<TabsList className="pb-3">
							{stages.map((s) => (
								<TabsTrigger key={s.code} value={s.code} className="relative">
									{STAGE_LABELS[s.code]?.short ?? s.code}
									{s.state === StageState.OPEN && <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-green" />}
								</TabsTrigger>
							))}
						</TabsList>
					</Tabs>
				)}
			</div>

			{currentStage && (
				<div className="flex flex-col gap-3 px-4 py-3">
					<div
						className={cn(
							'flex items-center justify-between gap-2 rounded-lg border px-4 py-3',
							isOpen ? 'border-green/40 bg-green/10' : 'border-border bg-surface',
						)}
					>
						<div className="flex flex-col gap-1">
							<span className={cn('flex items-center gap-2 text-xs font-bold', isOpen ? 'text-green' : 'text-sub')}>
								{isOpen ? (
									<>
										<CalendarClock className="h-3.5 w-3.5" /> Apostas abertas
									</>
								) : (
									<>
										<Lock className="h-3.5 w-3.5" /> Fase encerrada
									</>
								)}
							</span>
							<span className="text-xs text-sub">
								{isOpen
									? `Prazo: ${formatDeadline(currentStage.deadline)} · +${SCORING_RULES.exactScore} placar exato`
									: 'Veja seus resultados abaixo'}
								{currentStage.importedMatchCount < currentStage.expectedMatchCount &&
									` · ${currentStage.importedMatchCount}/${currentStage.expectedMatchCount} partidas importadas`}
							</span>
						</div>
						<StageBadge state={currentStage.state} />
					</div>

					{stageItems.length === 0 ? (
						<EmptyState icon={Target} title="Nenhum jogo disponível" />
					) : groupedItems ? (
						Array.from(groupedItems.entries()).map(([group, items]) => (
							<div key={group}>
								<p className="mb-2 mt-4 text-xs font-bold uppercase tracking-widest text-md first:mt-0">{groupLabel(group)}</p>
								<div className="flex flex-col gap-2">
									{items.map((item) => (
										<BetCard
											key={item.match._id}
											item={item}
											draft={draft[item.match._id] ?? emptyDraft}
											disabled={!isOpen || item.match.status !== MatchStatus.SCHEDULED}
											onChange={(d) => setDraft((cur) => ({ ...cur, [item.match._id]: d }))}
										/>
									))}
								</div>
							</div>
						))
					) : (
						<div className="flex flex-col gap-2">
							{stageItems.map((item) => (
								<BetCard
									key={item.match._id}
									item={item}
									draft={draft[item.match._id] ?? emptyDraft}
									disabled={!isOpen || item.match.status !== MatchStatus.SCHEDULED}
									onChange={(d) => setDraft((cur) => ({ ...cur, [item.match._id]: d }))}
								/>
							))}
						</div>
					)}
				</div>
			)}

			{isOpen && stageItems.length > 0 && (
				<div className="sticky bottom-0 border-t border-border bg-background/95 px-4 py-3 backdrop-blur">
					<div className="mb-2 flex items-center justify-between text-xs">
						<span className="text-sub">Palpites preenchidos</span>
						<span className={filled === stageItems.length ? 'font-bold text-green' : 'font-bold text-sub'}>
							{filled}/{stageItems.length}
						</span>
					</div>
					<Progress value={(filled / stageItems.length) * 100} className="mb-3" />
					<Button
						onClick={handleSave}
						disabled={filled === 0 || submit.isPending}
						size="lg"
						className="w-full font-display text-lg tracking-wider shadow-[0_8px_24px_-12px_rgb(var(--acc)/0.6)]"
					>
						<Save className="h-4 w-4" /> {submit.isPending ? 'SALVANDO…' : `SALVAR ${filled} PALPITE${filled === 1 ? '' : 'S'}`}
					</Button>
				</div>
			)}
		</div>
	)
}
