import { useState } from 'react'
import { GoogleLogin, type CredentialResponse } from '@react-oauth/google'
import { toast } from 'sonner'
import { SCORING_RULES } from '@bolao/shared'

import { useAuth } from '@/providers/AuthProvider'

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
		<div className="flex min-h-screen w-full justify-center bg-background font-sans">
			<div className="relative flex w-full max-w-[430px] flex-col items-center justify-center gap-8 p-8">
				<div className="absolute inset-0 flex items-center justify-center" aria-hidden>
					{[300, 220, 140].map((s) => (
						<div key={s} className="absolute rounded-full border border-acc/5" style={{ width: s, height: s }} />
					))}
				</div>

				<div className="relative z-10 flex flex-col items-center gap-1">
					<h1 className="font-display text-5xl tracking-widest">
						COPA<span className="text-acc">BET</span>
					</h1>
					<p className="text-xs uppercase tracking-[0.2em] text-sub">Bolão · Copa do Mundo 2026</p>
				</div>

				<div className="relative z-10 w-full rounded-lg border border-border bg-surface p-6 text-left">
					<h2 className="text-base font-bold">Dispute com seus amigos</h2>
					<p className="mt-2 text-sm text-sub">Aposte nos placares de cada jogo e suba no ranking fase a fase.</p>
					<div className="mt-4 space-y-2 text-sm text-sub">
						<p className="font-semibold text-foreground">Pontuação por jogo:</p>
						<ul className="space-y-1.5">
							<li>🎯 +{SCORING_RULES.exactScore} pts — Placar exato</li>
							<li>⚽ +{SCORING_RULES.winnerWithGoal} pts — Vencedor + um gol</li>
							<li>✅ +{SCORING_RULES.correctWinner} pts — Só o vencedor</li>
							<li>🔢 +{SCORING_RULES.oneGoalCorrect} pts — Acertou um gol</li>
							<li>❌ 0 pts — Errou tudo</li>
						</ul>
						<p className="mt-3 text-xs text-muted-foreground">
							⏱ Apenas tempo regulamentar. Pênaltis não são considerados.
						</p>
					</div>
				</div>

				<div className="relative z-10 flex w-full justify-center">
					<GoogleLogin
						theme="filled_black"
						size="large"
						shape="pill"
						text="signin_with"
						onSuccess={handleCredential}
						onError={() => toast.error('Falha no login do Google')}
					/>
				</div>

				{loading && <p className="relative z-10 text-sm text-sub">Entrando…</p>}

				<p className="relative z-10 text-xs text-muted-foreground">Apenas membros do grupo têm acesso.</p>
			</div>
		</div>
	)
}
