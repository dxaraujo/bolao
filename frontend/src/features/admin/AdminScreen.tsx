import { useState } from 'react'
import { Loader2, Download, RefreshCw, Users, UserCheck, UserX, Shield, ShieldOff, Calendar } from 'lucide-react'
import { toast } from 'sonner'
import { MatchStage, STAGE_ORDER, StageState, type StagePayload, type StageReadinessItem, type UserPayload } from '@bolao/shared'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import {
	useAdminUsers,
	useImportMatches,
	useImportTeams,
	useRebuildLeaderboard,
	useStageReadiness,
	useSyncScores,
	useUpdateStage,
	useUpdateUser,
} from '@/hooks/useAdmin'
import { useAllStages } from '@/hooks/useStages'
import { STAGE_LABELS } from '@/lib/stage'
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
	const syncScores = useSyncScores()
	const rebuild = useRebuildLeaderboard()

	const actions: Array<{
		key: string
		title: string
		description: string
		icon: typeof Users
		tone: 'acc' | 'gold' | 'green' | 'purple'
		run: () => Promise<unknown>
		isPending: boolean
	}> = [
		{ key: 'teams', title: 'Importar Times', description: 'Sincroniza seleções da Football Data.', icon: Users, tone: 'acc', run: () => importTeams.mutateAsync(), isPending: importTeams.isPending },
		{ key: 'matches', title: 'Importar Partidas', description: 'Reimporta calendário (TBD são skipadas).', icon: Download, tone: 'gold', run: () => importMatches.mutateAsync(), isPending: importMatches.isPending },
		{ key: 'scores', title: 'Sincronizar Placares', description: 'Busca placares e recalcula leaderboard.', icon: RefreshCw, tone: 'green', run: () => syncScores.mutateAsync(), isPending: syncScores.isPending },
		{ key: 'rebuild', title: 'Reconstruir Leaderboard', description: 'Recalcula ranking do zero.', icon: RefreshCw, tone: 'purple', run: () => rebuild.mutateAsync(), isPending: rebuild.isPending },
	]

	const toneClasses: Record<'acc' | 'gold' | 'green' | 'purple', { card: string; icon: string }> = {
		acc: { card: 'border-acc/30 bg-acc/[0.06]', icon: 'text-acc' },
		gold: { card: 'border-gold/30 bg-gold/[0.06]', icon: 'text-gold' },
		green: { card: 'border-green/30 bg-green/[0.06]', icon: 'text-green' },
		purple: { card: 'border-purple/30 bg-purple/[0.06]', icon: 'text-purple' },
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
			<h2 className="text-xs font-bold uppercase tracking-wider text-sub">Ações</h2>
			<div className="grid gap-2 md:grid-cols-2 xl:grid-cols-4">
				{actions.map(({ key, title, description, icon: Icon, tone, run, isPending }) => {
					const t = toneClasses[tone]
					return (
						<Card key={key} className={cn('animate-fade-up flex items-center gap-3 p-3', t.card)}>
							<div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-surface', t.icon)}>
								<Icon className="h-5 w-5" />
							</div>
							<div className="flex-1 min-w-0">
								<div className="text-sm font-bold">{title}</div>
								<div className="text-xs text-sub">{description}</div>
							</div>
							<Button size="sm" variant="outline" disabled={isPending} onClick={() => handle(run, title)}>
								{isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Executar'}
							</Button>
						</Card>
					)
				})}
			</div>
		</section>
	)
}

const STATE_TONE: Record<StageState, 'green' | 'red' | 'sub'> = {
	[StageState.OPEN]: 'green',
	[StageState.CLOSED]: 'red',
	[StageState.LOCKED]: 'sub',
}

const STATE_LABEL: Record<StageState, string> = {
	[StageState.OPEN]: 'Aberta',
	[StageState.CLOSED]: 'Encerrada',
	[StageState.LOCKED]: 'Bloqueada',
}

function StagesSection() {
	const { data: stages, isLoading } = useAllStages()
	const { data: readiness } = useStageReadiness()

	const byCode = new Map<MatchStage, StageReadinessItem>((readiness ?? []).map((r) => [r.code as MatchStage, r]))

	return (
		<section className="flex flex-col gap-2">
			<h2 className="text-xs font-bold uppercase tracking-wider text-sub">Fases & Deadlines</h2>
			<p className="text-xs text-sub">
				Estado é derivado em tempo real. Edite o deadline para reabrir/encerrar uma fase ou ajustar o cronograma.
			</p>

			{isLoading || !stages ? (
				<>
					<Skeleton className="h-20 w-full" />
					<Skeleton className="h-20 w-full" />
				</>
			) : (
				<div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
					{stages.map((s) => (
						<StageRow key={s.code} stage={s} readiness={byCode.get(s.code as MatchStage)} />
					))}
				</div>
			)}
		</section>
	)
}

function StageRow({ stage, readiness }: { stage: StagePayload; readiness?: StageReadinessItem }) {
	const update = useUpdateStage()
	const [deadline, setDeadline] = useState(stage.deadline.slice(0, 16))
	const [expected, setExpected] = useState(String(stage.expectedMatchCount))

	const label = STAGE_LABELS[stage.code as MatchStage]?.full ?? stage.code

	async function save() {
		try {
			await update.mutateAsync({
				code: stage.code as MatchStage,
				deadline: new Date(deadline).toISOString(),
				expectedMatchCount: Number(expected),
			})
			toast.success(`${label} atualizada`)
		} catch (err) {
			toast.error(err instanceof Error ? err.message : 'Falha ao atualizar fase')
		}
	}

	return (
		<Card className="animate-fade-up p-3">
			<div className="flex items-center justify-between gap-2">
				<div>
					<div className="text-sm font-bold">{label}</div>
					<div className="text-xs text-sub">
						{stage.code} · {stage.order}/{Object.keys(STAGE_ORDER).length}
					</div>
				</div>
				<Badge tone={STATE_TONE[stage.state]}>{STATE_LABEL[stage.state]}</Badge>
			</div>

			<div className="mt-3 flex items-center gap-2 text-xs text-sub">
				<Calendar className="h-3.5 w-3.5" />
				<span>
					{stage.importedMatchCount}/{stage.expectedMatchCount} partidas
					{readiness?.predecessor && (
						<>
							{' '}
							· anterior: <span className="font-bold">{STAGE_LABEL_OR(readiness.predecessor.code)}</span> ({STATE_LABEL[readiness.predecessor.state]})
						</>
					)}
				</span>
			</div>

			<div className="mt-3 flex flex-col gap-2 text-xs">
				<label className="flex flex-col gap-1">
					<span className="text-sub">Deadline</span>
					<Input
						type="datetime-local"
						value={deadline}
						onChange={(e) => setDeadline(e.target.value)}
						className="h-9"
					/>
				</label>
				<label className="flex flex-col gap-1">
					<span className="text-sub">Partidas esperadas</span>
					<Input
						type="number"
						min={1}
						value={expected}
						onChange={(e) => setExpected(e.target.value)}
						className="h-9"
					/>
				</label>
				<Button size="sm" disabled={update.isPending} onClick={save} className="self-end">
					{update.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Salvar'}
				</Button>
			</div>
		</Card>
	)
}

function STAGE_LABEL_OR(code: MatchStage): string {
	return STAGE_LABELS[code]?.short ?? code
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

	const initials = user.name.split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase() ?? '').join('')

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
					{update.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : user.isActive ? (
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
					{update.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : user.isAdmin ? (
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
