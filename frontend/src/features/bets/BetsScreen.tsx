import { useEffect, useMemo, useState } from 'react'
import { Lock, Save, Target, CalendarClock } from 'lucide-react'
import { toast } from 'sonner'
import { MatchStage, StageStatus } from '@bolao/shared'

import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { EmptyState } from '@/components/shared/EmptyState'
import { StageBadge } from '@/components/shared/StageBadge'
import { cn } from '@/lib/cn'

import { useMyBets, useUpdateBets } from '@/hooks/useBets'
import { useStages } from '@/hooks/useStages'
import { useConfig } from '@/hooks/useConfig'
import { STAGE_LABELS, groupLabel } from '@/lib/stage'
import { formatDeadline } from '@/lib/format'

import { BetCard, type BetDraft } from './components/BetCard'

const emptyDraft: BetDraft = { homeTeamScore: '', awayTeamScore: '' }

export function BetsScreen() {
	const { data: stages, isLoading: stagesLoading } = useStages()
	const { data: bets, isLoading: betsLoading } = useMyBets()
	const { data: config } = useConfig()
	const updateBets = useUpdateBets()

	const [tab, setTab] = useState<MatchStage | undefined>(undefined)
	const [draft, setDraft] = useState<Record<string, BetDraft>>({})

	useEffect(() => {
		if (!stages?.length) return
		if (tab && stages.some((s) => s.matchStage === tab)) return
		const open = stages.find((s) => s.status === StageStatus.OPEN)
		setTab((open ?? stages[0]).matchStage)
	}, [stages, tab])

	useEffect(() => {
		if (!bets) return
		setDraft((current) => {
			const next: Record<string, BetDraft> = { ...current }
			for (const bet of bets) {
				if (!(bet._id in next)) {
					next[bet._id] = {
						homeTeamScore: bet.homeTeamScore != null ? String(bet.homeTeamScore) : '',
						awayTeamScore: bet.awayTeamScore != null ? String(bet.awayTeamScore) : '',
					}
				}
			}
			return next
		})
	}, [bets])

	const currentStage = stages?.find((s) => s.matchStage === tab)
	const isOpen = currentStage?.status === StageStatus.OPEN
	const isBlocked = currentStage?.status === StageStatus.BLOCKED

	const stageBets = useMemo(() => {
		if (!bets || !currentStage) return []
		return bets
			.filter((b) => b.stage === currentStage.matchStage)
			.sort((a, b) => new Date(a.utcDate).getTime() - new Date(b.utcDate).getTime())
	}, [bets, currentStage])

	const groupedBets = useMemo(() => {
		if (!stageBets.length) return null
		if (!stageBets.some((b) => b.group)) return null
		const map = new Map<string, typeof stageBets>()
		for (const bet of stageBets) {
			const key = bet.group ?? ''
			if (!map.has(key)) map.set(key, [])
			map.get(key)!.push(bet)
		}
		return map
	}, [stageBets])

	const filled = useMemo(() => {
		if (!isOpen) return 0
		return stageBets.filter((bet) => {
			const d = draft[bet._id] ?? emptyDraft
			return d.homeTeamScore !== '' && d.awayTeamScore !== ''
		}).length
	}, [draft, stageBets, isOpen])

	async function handleSave() {
		const payload = stageBets
			.map((bet) => {
				const d = draft[bet._id] ?? emptyDraft
				return {
					_id: bet._id,
					homeTeamScore: d.homeTeamScore === '' ? null : Number(d.homeTeamScore),
					awayTeamScore: d.awayTeamScore === '' ? null : Number(d.awayTeamScore),
				}
			})
			.filter((b) => b.homeTeamScore != null && b.awayTeamScore != null)

		if (payload.length === 0) {
			toast.error('Preencha pelo menos um palpite')
			return
		}

		try {
			await updateBets.mutateAsync(payload)
			toast.success(`${payload.length} palpite${payload.length > 1 ? 's salvos' : ' salvo'}`)
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
				<Tabs value={tab} onValueChange={(v) => setTab(v as MatchStage)}>
					<TabsList className="pb-3">
						{stages.map((s) => (
							<TabsTrigger
								key={s.matchStage}
								value={s.matchStage}
								disabled={s.status === StageStatus.DISABLED}
								className="relative"
							>
								{STAGE_LABELS[s.matchStage]?.short ?? s.matchStage}
								{s.status === StageStatus.OPEN && (
									<span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-green" />
								)}
							</TabsTrigger>
						))}
					</TabsList>
				</Tabs>
			</div>

			{currentStage && (
				<div className="flex flex-col gap-3 px-4 py-3">
					<div
						className={cn(
							'flex items-center justify-between gap-2 rounded-lg border px-4 py-3',
							isOpen
								? 'border-green/40 bg-green/10'
								: isBlocked
									? 'border-border bg-surface'
									: 'border-border bg-surface/60',
						)}
					>
						<div className="flex flex-col gap-1">
							<span
								className={cn(
									'flex items-center gap-2 text-xs font-bold',
									isOpen ? 'text-green' : isBlocked ? 'text-sub' : 'text-muted-foreground',
								)}
							>
								{isOpen ? (
									<>
										<CalendarClock className="h-3.5 w-3.5" /> Apostas abertas
									</>
								) : isBlocked ? (
									<>
										<Lock className="h-3.5 w-3.5" /> Fase encerrada
									</>
								) : (
									<>
										<CalendarClock className="h-3.5 w-3.5" /> Fase não disponível
									</>
								)}
							</span>
							<span className="text-xs text-sub">
								{isOpen && currentStage.deadline
									? `Prazo: ${formatDeadline(currentStage.deadline)}`
									: isOpen
										? `+${config?.pointsExactScore ?? 5} placar exato · +${config?.pointsCorrectWinner ?? 1} resultado`
										: 'Veja seus resultados abaixo'}
							</span>
						</div>
						<StageBadge status={currentStage.status} />
					</div>

					{stageBets.length === 0 ? (
						<EmptyState icon={Target} title="Nenhum palpite disponível" />
					) : groupedBets ? (
						Array.from(groupedBets.entries()).map(([group, bets]) => (
							<div key={group}>
								<p className="mb-2 mt-4 text-xs font-bold uppercase tracking-widest text-sub first:mt-0">
									{groupLabel(group)}
								</p>
								<div className="flex flex-col gap-2">
									{bets.map((bet) => (
										<BetCard
											key={bet._id}
											bet={bet}
											draft={draft[bet._id] ?? emptyDraft}
											disabled={!isOpen}
											onChange={(d) => setDraft((cur) => ({ ...cur, [bet._id]: d }))}
										/>
									))}
								</div>
							</div>
						))
					) : (
						<div className="flex flex-col gap-2">
							{stageBets.map((bet) => (
								<BetCard
									key={bet._id}
									bet={bet}
									draft={draft[bet._id] ?? emptyDraft}
									disabled={!isOpen}
									onChange={(d) => setDraft((cur) => ({ ...cur, [bet._id]: d }))}
								/>
							))}
						</div>
					)}
				</div>
			)}

			{isOpen && stageBets.length > 0 && (
				<div className="sticky bottom-0 border-t border-border bg-background/95 px-4 py-3 backdrop-blur">
					<div className="mb-2 flex items-center justify-between text-xs">
						<span className="text-sub">Palpites preenchidos</span>
						<span className={filled === stageBets.length ? 'font-bold text-green' : 'font-bold text-sub'}>
							{filled}/{stageBets.length}
						</span>
					</div>
					<Progress value={(filled / stageBets.length) * 100} className="mb-3" />
					<Button
						onClick={handleSave}
						disabled={filled === 0 || updateBets.isPending}
						size="lg"
						className="w-full font-display text-lg tracking-wider shadow-[0_8px_24px_-12px_rgb(var(--acc)/0.6)]"
					>
						<Save className="h-4 w-4" /> {updateBets.isPending ? 'SALVANDO…' : `SALVAR ${filled} PALPITE${filled === 1 ? '' : 'S'}`}
					</Button>
				</div>
			)}
		</div>
	)
}

