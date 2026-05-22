import { useState } from 'react'
import { Loader2, Download, RefreshCw, Users, Lock, Play, CheckCircle2, ChevronRight } from 'lucide-react'
import { toast } from 'sonner'
import { StageStatus, type StageVisibleItem } from '@bolao/shared'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import {
	useAdminStages,
	useAdvanceStage,
	useImportMatches,
	useImportTeams,
	useUpdateScores,
} from '@/hooks/useAdmin'
import { STAGE_LABELS } from '@/lib/stage'
import { cn } from '@/lib/cn'

export function AdminScreen() {
	return (
		<div className="flex flex-col gap-4 px-4 py-4">
			<header>
				<h1 className="font-display text-2xl tracking-wider">Painel Admin</h1>
				<p className="mt-1 text-[11px] text-sub">
					Acesso restrito. Use com cuidado — as importações chamam a Football Data API.
				</p>
			</header>

			<ImportSection />
			<StagesSection />
		</div>
	)
}

function ImportSection() {
	const importTeams = useImportTeams()
	const importMatches = useImportMatches()
	const updateScores = useUpdateScores()

	const actions: Array<{
		key: string
		title: string
		description: string
		icon: typeof Users
		tone: 'acc' | 'gold' | 'green'
		run: () => Promise<unknown>
		isPending: boolean
	}> = [
		{
			key: 'teams',
			title: 'Importar Times',
			description: 'Sincroniza os times da competição com a Football Data API.',
			icon: Users,
			tone: 'acc',
			run: () => importTeams.mutateAsync(),
			isPending: importTeams.isPending,
		},
		{
			key: 'matches',
			title: 'Importar Partidas',
			description: 'Importa partidas e cria fases (stages) ainda não registradas.',
			icon: Download,
			tone: 'gold',
			run: () => importMatches.mutateAsync(),
			isPending: importMatches.isPending,
		},
		{
			key: 'scores',
			title: 'Atualizar Resultados',
			description: 'Busca placares das partidas iniciadas e recalcula pontuações.',
			icon: RefreshCw,
			tone: 'green',
			run: () => updateScores.mutateAsync(),
			isPending: updateScores.isPending,
		},
	]

	const toneClasses: Record<'acc' | 'gold' | 'green', { card: string; icon: string }> = {
		acc: { card: 'border-acc/30 bg-acc/[0.06]', icon: 'text-acc' },
		gold: { card: 'border-gold/30 bg-gold/[0.06]', icon: 'text-gold' },
		green: { card: 'border-green/30 bg-green/[0.06]', icon: 'text-green' },
	}

	async function handle(run: () => Promise<unknown>, title: string) {
		try {
			await run()
			toast.success(`${title} concluído`)
		} catch (err) {
			toast.error(err instanceof Error ? err.message : `Falha em ${title}`)
		}
	}

	return (
		<section className="flex flex-col gap-2">
			<h2 className="text-[11px] font-bold uppercase tracking-wider text-sub">Importações</h2>
			<div className="flex flex-col gap-2">
				{actions.map(({ key, title, description, icon: Icon, tone, run, isPending }) => {
					const t = toneClasses[tone]
					return (
						<Card key={key} className={cn('animate-fade-up flex items-center gap-3 p-3', t.card)}>
							<div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-surface', t.icon)}>
								<Icon className="h-5 w-5" />
							</div>
							<div className="flex-1">
								<div className="text-sm font-bold">{title}</div>
								<div className="text-[11px] text-sub">{description}</div>
							</div>
							<Button
								size="sm"
								variant="outline"
								disabled={isPending}
								onClick={() => handle(run, title)}
							>
								{isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Executar'}
							</Button>
						</Card>
					)
				})}
			</div>
		</section>
	)
}

function StagesSection() {
	const { data: stages, isLoading } = useAdminStages()

	return (
		<section className="flex flex-col gap-2">
			<h2 className="text-[11px] font-bold uppercase tracking-wider text-sub">Gerenciar Fases</h2>
			<p className="text-[11px] text-sub">
				Avance pela ordem <span className="font-bold text-foreground">DISABLED → OPEN → BLOCKED</span>.
				Abrir uma fase cria automaticamente palpites em branco para os usuários ativos.
			</p>

			{isLoading || !stages ? (
				<>
					<Skeleton className="h-20 w-full" />
					<Skeleton className="h-20 w-full" />
				</>
			) : stages.length === 0 ? (
				<Card className="p-4 text-center text-xs text-sub">
					Nenhuma fase cadastrada. Rode "Importar Partidas" primeiro.
				</Card>
			) : (
				<div className="flex flex-col gap-2">
					{stages.map((stage) => (
						<StageRow key={stage.matchStage} stage={stage} />
					))}
				</div>
			)}
		</section>
	)
}

const NEXT_STATUS: Partial<Record<StageStatus, StageStatus>> = {
	[StageStatus.DISABLED]: StageStatus.OPEN,
	[StageStatus.OPEN]: StageStatus.BLOCKED,
}

const NEXT_LABEL: Partial<Record<StageStatus, string>> = {
	[StageStatus.DISABLED]: 'Abrir apostas',
	[StageStatus.OPEN]: 'Encerrar fase',
}

const STATUS_TONE: Record<StageStatus, 'green' | 'red' | 'sub'> = {
	[StageStatus.DISABLED]: 'sub',
	[StageStatus.OPEN]: 'green',
	[StageStatus.BLOCKED]: 'red',
}

const STATUS_LABEL: Record<StageStatus, string> = {
	[StageStatus.DISABLED]: 'Em breve',
	[StageStatus.OPEN]: 'Aberto',
	[StageStatus.BLOCKED]: 'Encerrado',
}

const STATUS_ICON: Record<StageStatus, typeof Lock> = {
	[StageStatus.DISABLED]: Lock,
	[StageStatus.OPEN]: Play,
	[StageStatus.BLOCKED]: CheckCircle2,
}

function StageRow({ stage }: { stage: StageVisibleItem }) {
	const advance = useAdvanceStage()
	const next = NEXT_STATUS[stage.status]
	const needsDeadline = next === StageStatus.OPEN
	const [deadline, setDeadline] = useState<string>(() =>
		stage.deadline ? toLocalInput(stage.deadline) : '',
	)

	const StatusIcon = STATUS_ICON[stage.status]
	const label = STAGE_LABELS[stage.matchStage as keyof typeof STAGE_LABELS]?.full ?? stage.matchStage

	async function handleAdvance() {
		if (!next) return
		if (needsDeadline && !deadline) {
			toast.error('Informe o prazo antes de abrir a fase')
			return
		}
		try {
			await advance.mutateAsync({
				matchStage: stage.matchStage,
				status: next,
				deadline: needsDeadline && deadline ? new Date(deadline).toISOString() : undefined,
			})
			toast.success(`${label}: ${STATUS_LABEL[next]}`)
		} catch (err) {
			toast.error(err instanceof Error ? err.message : 'Falha ao atualizar fase')
		}
	}

	return (
		<Card className="animate-fade-up p-3">
			<div className="flex items-center justify-between gap-2">
				<div className="flex items-center gap-2">
					<StatusIcon className="h-4 w-4 text-sub" />
					<div>
						<div className="text-sm font-bold">{label}</div>
						<div className="mt-0.5 text-[10px] text-sub">{stage.matchStage}</div>
					</div>
				</div>
				<Badge tone={STATUS_TONE[stage.status]}>{STATUS_LABEL[stage.status]}</Badge>
			</div>

			{stage.deadline && (
				<div className="mt-2 text-[10px] text-sub">Prazo atual: {formatDeadline(stage.deadline)}</div>
			)}

			{next && (
				<div className="mt-3 flex flex-col gap-2">
					{needsDeadline && (
						<div className="flex flex-col gap-1">
							<label className="text-[10px] font-semibold uppercase tracking-wide text-sub">
								Prazo para apostas
							</label>
							<Input
								type="datetime-local"
								value={deadline}
								onChange={(e) => setDeadline(e.target.value)}
								className="h-9 text-sm"
							/>
						</div>
					)}
					<Button
						size="sm"
						disabled={advance.isPending}
						onClick={handleAdvance}
						className="self-end"
					>
						{advance.isPending ? (
							<Loader2 className="h-4 w-4 animate-spin" />
						) : (
							<>
								{NEXT_LABEL[stage.status]} <ChevronRight className="h-4 w-4" />
							</>
						)}
					</Button>
				</div>
			)}
		</Card>
	)
}

function toLocalInput(iso: string) {
	const d = new Date(iso)
	const pad = (n: number) => String(n).padStart(2, '0')
	return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function formatDeadline(iso: string) {
	const d = new Date(iso)
	return d.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
}
