import { Loader2, Download, RefreshCw, Users, UserCheck, UserX, Shield, ShieldOff, Calendar } from 'lucide-react'
import { toast } from 'sonner'
import { MatchStage, StageState, type StagePayload, type UserPayload } from '@bolao/shared'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { useAdminUsers, useImportMatches, useImportTeams, useRebuildLeaderboard, useUpdateUser } from '@/hooks/useAdmin'
import { useAllStages } from '@/hooks/useStages'
import { STAGE_LABELS } from '@/lib/stage'
import { formatDeadline } from '@/lib/format'
import { resolveAssetUrl } from '@/lib/assets'
import { cn } from '@/lib/cn'

export function AdminScreen() {
	return (
		<div className="flex flex-col gap-4 px-4 py-4">
			<header>
				<h1 className="font-display text-3xl tracking-wider">Painel Admin</h1>
				<p className="mt-1 text-xs text-sub">Importações chamam a Football Data API; use com critério.</p>
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
	const rebuild = useRebuildLeaderboard()

	const actions: Array<{
		key: string
		title: string
		description: string
		icon: typeof Users
		run: () => Promise<unknown>
		isPending: boolean
	}> = [
		{
			key: 'teams',
			title: 'Importar Times',
			description: 'Sincroniza seleções da Football Data.',
			icon: Users,
			run: () => importTeams.mutateAsync(),
			isPending: importTeams.isPending,
		},
		{
			key: 'matches',
			title: 'Importar Partidas & Placares',
			description: 'Reimporta calendário e placares; recalcula leaderboard se houver mudanças.',
			icon: Download,
			run: () => importMatches.mutateAsync(),
			isPending: importMatches.isPending,
		},
		{
			key: 'rebuild',
			title: 'Reconstruir Leaderboard',
			description: 'Recalcula ranking do zero.',
			icon: RefreshCw,
			run: () => rebuild.mutateAsync(),
			isPending: rebuild.isPending,
		},
	]

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
			<h2 className="text-xs font-bold uppercase tracking-wider text-sub">Ações</h2>
			<Card className="animate-fade-up grid grid-cols-2 divide-x divide-y divide-border md:grid-cols-4 md:divide-y-0">
				{actions.map(({ key, title, description, icon: Icon, run, isPending }) => (
					<button
						key={key}
						type="button"
						disabled={isPending}
						onClick={() => handle(run, title)}
						title={description}
						className="group flex flex-col items-center gap-2 p-4 transition-colors hover:bg-acc/[0.06] focus:bg-acc/[0.06] focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
					>
						<div className="flex h-12 w-12 items-center justify-center rounded-full bg-acc/10 text-acc transition-transform group-hover:scale-110">
							{isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Icon className="h-5 w-5" />}
						</div>
						<div className="text-xs font-bold uppercase tracking-wide text-center">{title}</div>
						<div className="text-[11px] leading-tight text-sub text-center line-clamp-2">{description}</div>
					</button>
				))}
			</Card>
		</section>
	)
}

const STATE_TONE: Record<StageState, 'green' | 'acc' | 'sub'> = {
	[StageState.OPEN]: 'green',
	[StageState.CLOSED]: 'acc',
	[StageState.LOCKED]: 'sub',
}

const STATE_LABEL: Record<StageState, string> = {
	[StageState.OPEN]: 'Aberta',
	[StageState.CLOSED]: 'Apostas Encerrada',
	[StageState.LOCKED]: 'Bloqueada',
}

function StagesSection() {
	const { data: stages, isLoading } = useAllStages()

	return (
		<section className="flex flex-col gap-2">
			<h2 className="text-xs font-bold uppercase tracking-wider text-sub">Fases & Deadlines</h2>
			<p className="text-xs text-sub">Estado é derivado do deadline (read-only).</p>

			{isLoading || !stages ? (
				<Skeleton className="h-64 w-full" />
			) : (
				<Card className="animate-fade-up p-4">
					<ol className="relative flex flex-col">
						{stages.map((s, i) => (
							<StageRow key={s.code} stage={s} isLast={i === stages.length - 1} />
						))}
					</ol>
				</Card>
			)}
		</section>
	)
}

const STATE_BAR: Record<StageState, string> = {
	[StageState.OPEN]: 'bg-green',
	[StageState.CLOSED]: 'bg-acc/60',
	[StageState.LOCKED]: 'bg-border',
}

const STATE_DOT: Record<StageState, string> = {
	[StageState.OPEN]: 'bg-green text-background ring-green/30',
	[StageState.CLOSED]: 'bg-acc/70 text-background ring-acc/30',
	[StageState.LOCKED]: 'bg-muted text-sub ring-border',
}

function StageRow({ stage, isLast }: { stage: StagePayload; isLast: boolean }) {
	const label = STAGE_LABELS[stage.code as MatchStage]?.full ?? stage.code
	const progress = stage.expectedMatchCount === 0 ? 0 : (stage.finishedMatchCount / stage.expectedMatchCount) * 100

	return (
		<li className={cn('relative flex gap-3', !isLast && 'pb-4')}>
			{!isLast && <div className="absolute left-[11px] top-7 h-full w-px bg-border" aria-hidden />}

			<div
				className={cn(
					'relative z-10 mt-0.5 flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full font-display text-[11px] ring-4',
					STATE_DOT[stage.state],
				)}
			>
				{stage.order}
			</div>

			<div className="min-w-0 flex-1">
				<div className="flex items-center justify-between gap-2">
					<div className="truncate text-sm font-bold">{label}</div>
					<Badge tone={STATE_TONE[stage.state]}>{STATE_LABEL[stage.state]}</Badge>
				</div>
				<div className="mt-0.5 flex items-center justify-between gap-2 text-[11px] text-sub">
					<span className="inline-flex items-center gap-1 tabular-nums">
						<Calendar className="h-3 w-3" />
						{formatDeadline(stage.deadline)}
					</span>
					<span className="tabular-nums font-bold">
						{stage.finishedMatchCount}/{stage.expectedMatchCount}
					</span>
				</div>
				<div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-muted">
					<div
						className={cn('h-full rounded-full transition-[width] duration-700 ease-out', STATE_BAR[stage.state])}
						style={{ width: `${progress}%` }}
					/>
				</div>
			</div>
		</li>
	)
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
			<h2 className="text-xs font-bold uppercase tracking-wider text-sub">Usuários</h2>
			<p className="text-xs text-sub">
				Apenas usuários <span className="font-bold text-foreground">ativos</span> palpitam e entram no ranking. Inativos veem como espectadores.
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
					{sorted.map((u) => (
						<UserRow key={u._id} user={u} />
					))}
				</div>
			)}
		</section>
	)
}

function UserRow({ user }: { user: UserPayload }) {
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
				{user.avatar && <AvatarImage src={resolveAssetUrl(user.avatar)} alt={user.name} />}
				<AvatarFallback>{initials}</AvatarFallback>
			</Avatar>
			<div className="min-w-0 flex-1">
				<div className="flex items-center gap-1.5">
					<span className="truncate text-sm font-bold">{user.name}</span>
					{user.isAdmin && <Shield className="h-3.5 w-3.5 shrink-0 text-gold" aria-label="Admin" />}
				</div>
				<div className="truncate text-xs text-sub">{user.email}</div>
				<div className="mt-1">
					<Badge tone={user.isActive ? 'green' : 'sub'}>{user.isActive ? 'Ativo' : 'Espectador'}</Badge>
				</div>
			</div>
			<div className="flex shrink-0 flex-col gap-1.5">
				<Button size="sm" variant="outline" disabled={update.isPending} onClick={toggleActive}>
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
				<Button size="sm" variant="outline" disabled={update.isPending} onClick={toggleAdmin}>
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
