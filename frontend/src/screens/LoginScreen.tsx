import { useState } from 'react'
import { SCORING } from '@/lib/enums'
import { useGoogleLogin } from '@/hooks/useGoogleLogin'

interface LoginScreenProps {
  onLogin: () => void
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [error, setError] = useState<string | null>(null)
  const { buttonRef, loginFallback, hasClientId } = useGoogleLogin(onLogin, setError)

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-8 py-12 bg-copa-bg dark:bg-[#070d18] relative overflow-hidden min-h-screen w-full">
      {[300, 220, 140].map((s, i) => (
        <div
          key={s}
          className="absolute rounded-full pointer-events-none -translate-x-1/2 -translate-y-1/2"
          style={{
            width: s,
            height: s,
            top: '50%',
            left: '50%',
            border: `1px solid rgba(0,229,255,${[0.04, 0.06, 0.08][i]})`,
          }}
        />
      ))}
      <div className="animate-fade-up w-full max-w-sm sm:max-w-md z-10">
        <div className="text-center mb-8">
          <h1 className="font-display text-6xl tracking-widest leading-none text-copa-text dark:text-[#f0f6ff]">
            COPA<span className="text-copa-acc dark:text-[#00e5ff]">BET</span>
          </h1>
          <p className="text-xs text-copa-sub dark:text-[#64849f] mt-1 tracking-[0.25em] uppercase">
            Bolão · Copa do Mundo 2026
          </p>
        </div>
        <div className="rounded-2xl border border-copa-border dark:border-[#1e2f45] bg-copa-surface dark:bg-[#111d2e] p-5 mb-5">
          <p className="text-sm font-semibold text-copa-text dark:text-[#f0f6ff] mb-1">Dispute com seus amigos</p>
          <p className="text-xs text-copa-sub dark:text-[#64849f] leading-relaxed mb-4">
            Aposte nos placares de cada jogo e suba no ranking do grupo fase a fase.
          </p>
          <div className="space-y-2.5">
            {[
              { icon: '⚽', text: `+${SCORING.exactScore} pontos por placar exato` },
              { icon: '🎯', text: `+${SCORING.winnerWithGoal} vencedor certo + 1 gol` },
              { icon: '✅', text: `+${SCORING.correctWinner} pelo vencedor · +${SCORING.oneGoalCorrect} por 1 gol` },
              { icon: '📅', text: 'Apostas por fase com prazo definido' },
            ].map(({ icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <span className="text-base">{icon}</span>
                <span className="text-xs text-copa-sub dark:text-[#64849f]">{text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col items-center gap-3">
          {hasClientId ? (
            <div ref={buttonRef} className="w-full flex justify-center min-h-[44px]" />
          ) : (
            <button
              onClick={loginFallback}
              className="w-full h-12 rounded-xl flex items-center justify-center gap-3 border border-copa-border dark:border-[#1e2f45] bg-copa-surface dark:bg-[#111d2e] text-copa-text dark:text-[#f0f6ff] font-semibold text-sm hover:bg-copa-surf2 dark:hover:bg-[#172438] transition-colors"
            >
              Entrar com Google
            </button>
          )}
          {error && (
            <p className="text-xs text-red-400 text-center">{error}</p>
          )}
        </div>
        <p className="text-center text-[10px] text-copa-mutedT dark:text-[#3a5270] mt-3">
          Apenas membros do grupo têm acesso
        </p>
      </div>
    </div>
  )
}
