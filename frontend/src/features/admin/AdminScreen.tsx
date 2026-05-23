import { Loader2, Download, RefreshCw, Users, Lock, Play, CheckCircle2, ChevronRight, UserCheck, UserX, Shield, ShieldOff } from 'lucide-react'
import { toast } from 'sonner'
import { MatchStage, STAGE_ORDER, StageStatus, type AuthenticatedUser, type StageVisibleItem } from '@bolao/shared'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import {
	useAdminStages,
	useAdminUsers,
	useAdvanceStage,
	useImportMatches,
	useImportTeams,
	useUpdateScores,
	useUpdateUser,
} from '@/hooks/useAdmin'
import { STAGE_LABELS } from '@/lib/stage'
import { cn } from '@/lib/cn'

export function AdminScreen() {
	return (
		<div className="flex flex-col gap-4 px-4 py-4">
			<header>
				<h1 className="font-display text-3xl tracking-wider">Painel Admin</h1>
				<p className="mt-1 text-xs text-sub">
					Acesso restrito. Use com cuidado — as importações chamam a Football Data API.
				</p>
			</header>

			<ImportSection />
			<StagesSection />
			<UsersSection />
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
			<h2 className="text-xs font-bold uppercase tracking-wider text-sub">Importações</h2>
			<div className="grid gap-2 md:grid-cols-3">
				{actions.map(({ key, title, description, icon: Icon, tone, run, isPending }) => {
					const t = toneClasses[tone]
					return (
						<Card key={key} className={cn('animate-fade-up flex items-center gap-3 p-3', t.card)}>
							<div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-surface', t.icon)}>
								<Icon className="h-5 w-5" />
							</div>
							<div className="flex-1">
								<div className="text-sm font-bold">{title}</div>
								<div className="text-xs text-sub">{description}</div>
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

const TOTAL_STAGES = Object.keys(STAGE_ORDER).length

/** Fase imediatamente anterior por ordem; `FINAL` depende de `SEMI_FINALS` (exceção). */
function getRequiredPreviousStage(matchStage: MatchStage): MatchStage | null {
	if (matchStage === MatchStage.GROUP_STAGE) return null
	if (matchStage === MatchStage.FINAL) return MatchStage.SEMI_FINALS
	const order = STAGE_ORDER[matchStage]
	const previous = (Object.entries(STAGE_ORDER) as [MatchStage, number][]).find(
		([, o]) => o === order - 1,
	)
	return previous ? previous[0] : null
}

function StagesSection() {
	const { data: stages, isLoading } = useAdminStages()

	const workflowSteps: MatchStage[] = [
		MatchStage.GROUP_STAGE,
		MatchStage.LAST_32,
		MatchStage.LAST_16,
		MatchStage.QUARTER_FINALS,
		MatchStage.SEMI_FINALS,
		MatchStage.THIRD_PLACE,
		MatchStage.FINAL,
	]

	return (
		<section className="flex flex-col gap-2">
			<h2 className="text-xs font-bold uppercase tracking-wider text-sub">Gerenciar Fases</h2>
			<p className="text-xs text-sub">
				Avance cada fase pela sequência <span className="font-bold text-foreground">Em breve → Aberto → Encerrado</span>.
				Abrir uma fase importa as partidas e cria apostas em branco para os usuários ativos.
			</p>

			<Card className="flex flex-col gap-2 p-3 text-xs">
				<div className="text-xs font-bold uppercase tracking-wider text-sub">Workflow de abertura</div>
				<div className="flex flex-wrap items-center gap-1.5 text-xs">
					{workflowSteps.map((s, i) => (
						<span key={s} className="flex items-center gap-1.5">
							<span className="rounded bg-surface px-1.5 py-0.5 font-mono text-[10px]">
								{STAGE_ORDER[s]}. {STAGE_LABELS[s].short}
							</span>
							{i < workflowSteps.length - 1 && <ChevronRight className="h-3 w-3 text-sub" />}
						</span>
					))}
				</div>
				<div className="text-xs text-sub">
					Cada fase só pode ser aberta quando a anterior estiver <span className="font-bold text-foreground">encerrada</span>.
					Exceção: <span className="font-bold text-foreground">{STAGE_LABELS[MatchStage.THIRD_PLACE].short}</span> e{' '}
					<span className="font-bold text-foreground">{STAGE_LABELS[MatchStage.FINAL].short}</span> dependem ambas de{' '}
					<span className="font-bold text-foreground">{STAGE_LABELS[MatchStage.SEMI_FINALS].short}</span> e podem ficar abertas em paralelo.
				</div>
			</Card>

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
				<div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
					{stages.map((stage) => (
						<StageRow key={stage.matchStage} stage={stage} allStages={stages} />
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

function StageRow({ stage, allStages }: { stage: StageVisibleItem; allStages: StageVisibleItem[] }) {
	const advance = useAdvanceStage()
	const next = NEXT_STATUS[stage.status]

	const StatusIcon = STATUS_ICON[stage.status]
	const matchStage = stage.matchStage as MatchStage
	const label = STAGE_LABELS[matchStage]?.full ?? stage.matchStage

	const requiredPrevious = getRequiredPreviousStage(matchStage)
	const previousStage = requiredPrevious
		? allStages.find((s) => s.matchStage === requiredPrevious)
		: null
	const requirementSatisfied = !requiredPrevious || previousStage?.status === StageStatus.BLOCKED
	const isOpenable = next === StageStatus.OPEN && requirementSatisfied
	const isClosable = next === StageStatus.BLOCKED
	const canAdvance = isOpenable || isClosable

	async function handleAdvance() {
		if (!next || !canAdvance) return
		try {
			await advance.mutateAsync({ matchStage: stage.matchStage, status: next })
			toast.success(`${label}: ${STATUS_LABEL[next]}`)
		} catch (err) {
			toast.error(err instanceof Error ? err.message : 'Falha ao atualizar fase')
		}
	}

	return (
		<Card className="animate-fade-up p-3">
			<div className="flex items-center justify-between gap-2">
				<div className="flex items-center gap-2">
					<span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-border bg-surface font-mono text-[11px] text-sub">
						{stage.order}
					</span>
					<StatusIcon className="h-4 w-4 text-sub" />
					<div>
						<div className="text-sm font-bold">{label}</div>
						<div className="mt-0.5 text-xs text-sub">
							{stage.matchStage}
							<span className="ml-1 text-sub/70">· {stage.order}/{TOTAL_STAGES}</span>
						</div>
					</div>
				</div>
				<Badge tone={STATUS_TONE[stage.status]}>{STATUS_LABEL[stage.status]}</Badge>
			</div>

			{stage.deadline && (
				<div className="mt-2 text-xs text-sub">Prazo: {formatDeadline(stage.deadline)}</div>
			)}

			{requiredPrevious && stage.status === StageStatus.DISABLED && !requirementSatisfied && (
				<div className="mt-2 text-xs text-sub">
					Aguardando{' '}
					<span className="font-bold text-foreground">{STAGE_LABELS[requiredPrevious].short}</span>{' '}
					ser encerrada
				</div>
			)}

			{next && canAdvance && (
				<div className="mt-3 flex flex-col gap-2">
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

function formatDeadline(iso: string) {
	const d = new Date(iso)
	return d.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
}

function UsersSection() {
	const { data: users, isLoading } = useAdminUsers()

	const sorted = users
		? [...users].sort((a, b) => {
			if (a.isActive !== b.isActive) return a.isActive ? -1 : 1
			return a.name.localeCompare(b.name, 'pt-BR')
		})
		: []

	return (
		<section className="flex flex-col gap-2">
			<h2 className="text-xs font-bold uppercase tracking-wider text-sub">Gerenciar Usuários</h2>
			<p className="text-xs text-sub">
				Ative um usuário para criar automaticamente as apostas em branco nas fases já abertas ou encerradas.
			</p>

			{isLoading || !users ? (
				<>
					<Skeleton className="h-16 w-full" />
					<Skeleton className="h-16 w-full" />
				</>
			) : sorted.length === 0 ? (
				<Card className="p-4 text-center text-xs text-sub">Nenhum usuário cadastrado.</Card>
			) : (
				<div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
					{sorted.map((user) => (
						<UserRow key={user._id} user={user} />
					))}
				</div>
			)}
		</section>
	)
}

function UserRow({ user }: { user: AuthenticatedUser }) {
	const update = useUpdateUser()

	async function toggleActive() {
		const next = !user.isActive
		try {
			await update.mutateAsync({ id: user._id, isActive: next })
			toast.success(next ? `${user.name} ativado` : `${user.name} desativado`)
		} catch (err) {
			toast.error(err instanceof Error ? err.message : 'Falha ao atualizar usuário')
		}
	}

	async function toggleAdmin() {
		const next = !user.isAdmin
		try {
			await update.mutateAsync({ id: user._id, isAdmin: next })
			toast.success(next ? `${user.name} agora é admin` : `${user.name} não é mais admin`)
		} catch (err) {
			toast.error(err instanceof Error ? err.message : 'Falha ao atualizar usuário')
		}
	}

	const initials = user.name
		.split(/\s+/)
		.slice(0, 2)
		.map((p) => p[0]?.toUpperCase() ?? '')
		.join('')

	return (
		<Card className="animate-fade-up flex items-center gap-3 p-3">
			<Avatar className="h-10 w-10">
				{user.picture && <AvatarImage src={user.picture} alt={user.name} />}
				<AvatarFallback>{initials}</AvatarFallback>
			</Avatar>
			<div className="min-w-0 flex-1">
				<div className="flex items-center gap-1.5">
					<span className="truncate text-sm font-bold">{user.name}</span>
					{user.isAdmin && (
						<Shield className="h-3.5 w-3.5 shrink-0 text-gold" aria-label="Admin" />
					)}
				</div>
				<div className="truncate text-xs text-sub">{user.email}</div>
				<div className="mt-1">
					<Badge tone={user.isActive ? 'green' : 'sub'}>
						{user.isActive ? 'Ativo' : 'Inativo'}
					</Badge>
				</div>
			</div>
			<div className="flex shrink-0 flex-col gap-1.5">
				<Button
					size="sm"
					variant="outline"
					disabled={update.isPending}
					onClick={toggleActive}
				>
					{update.isPending ? (
						<Loader2 className="h-4 w-4 animate-spin" />
					) : user.isActive ? (
						<>
							<UserX className="h-4 w-4" /> Desativar
						</>
					) : (
						<>
							<UserCheck className="h-4 w-4" /> Ativar
						</>
					)}
				</Button>
				<Button
					size="sm"
					variant="outline"
					disabled={update.isPending}
					onClick={toggleAdmin}
				>
					{update.isPending ? (
						<Loader2 className="h-4 w-4 animate-spin" />
					) : user.isAdmin ? (
						<>
							<ShieldOff className="h-4 w-4" /> Remover admin
						</>
					) : (
						<>
							<Shield className="h-4 w-4" /> Tornar admin
						</>
					)}
				</Button>
			</div>
		</Card>
	)
}
