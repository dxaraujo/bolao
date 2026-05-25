import { useState } from 'react'
import { GoogleLogin, type CredentialResponse } from '@react-oauth/google'
import { toast } from 'sonner'
import { Clock, CircleDot, Goal, Target, Trophy, X, type LucideIcon } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { MatchStage, SCORING_RULES, STAGE_DEADLINES, STAGE_ORDER } from '@bolao/shared'

import { useAuth } from '@/providers/AuthProvider'
import { STAGE_LABELS } from '@/lib/stage'

const RULES: Array<{ icon: LucideIcon; label: string; points: number; tone: string }> = [
	{ icon: Trophy, label: 'Placar exato', points: SCORING_RULES.exactScore, tone: 'text-green' },
	{ icon: Goal, label: 'Vencedor + um gol', points: SCORING_RULES.winnerWithGoal, tone: 'text-acc' },
	{ icon: Target, label: 'Somente o vencedor', points: SCORING_RULES.correctWinner, tone: 'text-gold' },
	{ icon: CircleDot, label: 'Acertou um gol', points: SCORING_RULES.oneGoalCorrect, tone: 'text-purple' },
	{ icon: X, label: 'Errou tudo', points: 0, tone: 'text-red' },
]

const STAGES = (Object.entries(STAGE_ORDER) as Array<[MatchStage, number]>)
	.sort(([, a], [, b]) => a - b)
	.map(([code, order]) => ({
		code,
		order,
		label: STAGE_LABELS[code]?.full ?? code,
		deadline: new Date(STAGE_DEADLINES[code]),
	}))

export function LoginScreen() {
	const { loginWithGoogle } = useAuth()
	const [loading, setLoading] = useState(false)

	async function handleCredential(response: CredentialResponse) {
		if (!response.credential) return
		try {
			setLoading(true)
			await loginWithGoogle(response.credential)
		} catch (e) {
			toast.error(e instanceof Error ? e.message : 'Falha ao entrar')
		} finally {
			setLoading(false)
		}
	}

	return (
		<div className="relative flex min-h-screen w-full justify-center overflow-hidden bg-background font-sans">
			{/* Glow ambiente */}
			<div className="pointer-events-none absolute -top-32 left-1/2 h-[480px] w-[480px] -translate-x-1/2 rounded-full bg-acc/10 blur-3xl" aria-hidden />
			<div
				className="pointer-events-none absolute -bottom-40 left-1/2 h-[400px] w-[400px] -translate-x-1/2 rounded-full bg-gold/5 blur-3xl"
				aria-hidden
			/>

			<div className="relative flex w-full max-w-[440px] flex-col gap-10 px-6 py-10">
				{/* Logo + título — sem card, sem borda, ícone grande */}
				<header className="flex flex-col items-center gap-4">
					<img src="/favicon-192x192.png" alt="" className="h-32 w-32 drop-shadow-[0_8px_30px_rgba(0,229,255,0.25)]" />
					{/* <div className="flex flex-col items-center">
						<h1 className="font-display text-5xl tracking-widest leading-none">
							COPA<span className="text-acc">BET</span>
						</h1>
						<p className="mt-2 text-[11px] uppercase tracking-[0.25em] text-sub">Bolão · Copa do Mundo 2026</p>
					</div> */}
				</header>

				{/* Cronograma — inline, linha contínua */}
				<section className="flex flex-col gap-3">
					<div className="flex items-baseline justify-between">
						<h2 className="text-xs font-bold uppercase tracking-wider text-sub">Cronograma</h2>
						<span className="text-[10px] uppercase tracking-wide text-muted-foreground">deadline das apostas</span>
					</div>
					<ol className="relative flex flex-col">
						<div className="absolute left-[9px] bottom-2 top-2 w-px bg-border" aria-hidden />
						{STAGES.map((stage) => (
							<li key={stage.code} className="relative flex items-center gap-3 py-1">
								<div className="z-10 flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-bold text-sub">
									{stage.order}
								</div>
								<span className="flex-1 text-sm">{stage.label}</span>
								<span className="font-display text-xs tabular-nums text-sub">
									{format(stage.deadline, "dd/MM '·' HH'h'", { locale: ptBR })}
								</span>
							</li>
						))}
					</ol>
				</section>

				{/* Pontuação — inline, sem card */}
				<section className="flex flex-col gap-3">
					<div className="flex items-baseline justify-between">
						<h2 className="text-xs font-bold uppercase tracking-wider text-sub">Como pontuar</h2>
						<span className="text-[10px] uppercase tracking-wide text-muted-foreground">por partida</span>
					</div>
					<ul className="flex flex-col gap-2">
						{RULES.map(({ icon: Icon, label, points, tone }) => (
							<li key={label} className="flex items-center gap-3">
								<Icon className={`h-4 w-4 shrink-0 ${tone}`} />
								<span className="flex-1 text-sm">{label}</span>
								<span className={`font-display text-base leading-none tabular-nums ${tone}`}>
									{points > 0 ? `+${points}` : points}
									<span className="ml-1 text-[10px] uppercase tracking-wide text-sub">{points === 1 ? 'pt' : 'pts'}</span>
								</span>
							</li>
						))}
					</ul>
					<p className="mt-1 flex items-center gap-1.5 text-[11px] text-muted-foreground">
						<Clock className="h-3 w-3" /> Apenas tempo regulamentar. Pênaltis não contam.
					</p>
				</section>

				{/* Login — sem card */}
				<section className="flex flex-col items-center gap-3 pt-2 pb-3">
					<p className="text-center text-sm text-sub">Entre com sua conta Google para começar.</p>
					<GoogleLogin
						theme="filled_black"
						size="large"
						shape="pill"
						text="signin_with"
						onSuccess={handleCredential}
						onError={() => toast.error('Falha no login do Google')}
					/>
					{loading && <p className="text-xs text-sub">Entrando…</p>}
				</section>
			</div>
		</div>
	)
}
