import { useEffect, useMemo, useState } from 'react'
import { api } from '@/api/client'
import { useAppData } from '@/context/AppDataContext'
import { SCORING } from '@/lib/enums'
import { formatDeadline } from '@/lib/format'
import { StageBadge } from '@/components/shared/StageBadge'
import { LoadingState, ErrorState } from '@/components/shared/LoadingState'
import { Progress } from '@/components/ui/progress'
import type { BetMap } from '@/types'

const RESULT_COLOR: Record<string, string> = {
  exact: 'text-[#22c55e] border-[#22c55e]/30 bg-[#22c55e]/8',
  correct: 'text-[#f59e0b] border-[#f59e0b]/30 bg-[#f59e0b]/8',
}
const RESULT_LABEL: Record<string, string> = {
  exact: `🎯 Exato +${SCORING.exactScore}pts`,
  correct: `✓ Vencedor +${SCORING.correctWinner}pts`,
}

function getResult(bet: { h: number; a: number }, hs: number, as_: number): 'exact' | 'correct' | null {
  if (bet.h === hs && bet.a === as_) return 'exact'
  const dir = (h: number, a: number) => (h > a ? 'H' : h < a ? 'A' : 'D')
  return dir(bet.h, bet.a) === dir(hs, as_) ? 'correct' : null
}

export function BetsScreen() {
  const { me, stages, matches, myBets, myOpenBets, loading, error, refresh, refreshBets } = useAppData()
  const [si, setSi] = useState(0)
  const [bets, setBets] = useState<BetMap>({})
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  useEffect(() => {
    const openIdx = stages.findIndex((s) => s.status === 'OPEN')
    if (openIdx >= 0) setSi(openIdx)
  }, [stages])

  const stage = stages[si]
  const isOpen = stage?.status === 'OPEN'
  const isBlocked = stage?.status === 'BLOCKED'
  const stageMatches = useMemo(
    () => (stage ? matches.filter((m) => m.matchStage === stage.matchStage) : []),
    [matches, stage],
  )


  useEffect(() => {
    if (!isOpen || !stage) return
    const initial: BetMap = {}
    for (const m of stageMatches) {
      const existing = myOpenBets[m.id]
      initial[m.id] = existing?.bet ?? { h: '', a: '' }
    }
    setBets(initial)
  }, [isOpen, stage, stageMatches, myOpenBets])

  const filled = isOpen ? Object.values(bets).filter((b) => b.h !== '' && b.a !== '').length : 0

  async function save() {
    if (!me) return
    setSaving(true)
    setSaveError(null)
    try {
      const payload = stageMatches
        .map((m) => {
          const bet = bets[m.id]
          const meta = myOpenBets[m.id]
          if (!meta?.betId || !bet || bet.h === '' || bet.a === '') return null
          return {
            _id: meta.betId,
            homeTeamScore: Number(bet.h),
            awayTeamScore: Number(bet.a),
          }
        })
        .filter(Boolean) as { _id: string; homeTeamScore: number; awayTeamScore: number }[]

      await api.updateBets(payload)
      await refreshBets()
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : 'Erro ao salvar')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <LoadingState />
  if (error) return <ErrorState message={error} onRetry={refresh} />
  if (!stage) {
    return (
      <div className="flex-1 flex items-center justify-center text-xs text-copa-sub dark:text-[#64849f]">
        Nenhuma fase disponível.
      </div>
    )
  }

  const deadlineLabel = formatDeadline(stage.deadline)

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="screen-px pt-3 pb-0 bg-gradient-to-b from-copa-bg2 dark:from-[#0d1526] to-transparent border-b border-copa-border dark:border-[#1e2f45]">
        <div className="flex gap-1.5 overflow-x-auto pb-3">
          {stages.map((s, i) => {
            const active = si === i
            const canClick = s.status !== 'DISABLED'
            return (
              <button
                key={s.matchStage}
                disabled={!canClick}
                onClick={() => {
                  setSi(i)
                  setSaved(false)
                }}
                className={`flex-shrink-0 rounded-xl px-3 py-1.5 text-xs font-bold tracking-wide border transition-all
                  ${active
                    ? 'bg-[#00e5ff]/15 dark:bg-[#00e5ff]/15 border-[#00e5ff]/50 text-copa-acc dark:text-[#00e5ff]'
                    : canClick
                      ? 'border-copa-border dark:border-[#1e2f45] text-copa-sub dark:text-[#64849f] hover:border-copa-borderB dark:hover:border-[#253a58]'
                      : 'border-copa-muted dark:border-[#243347] text-copa-muted dark:text-[#243347] cursor-not-allowed'
                  }`}
              >
                {s.short}
                {s.status === 'OPEN' && !active && (
                  <span className="ml-1.5 inline-block w-1.5 h-1.5 rounded-full bg-[#22c55e] align-middle" />
                )}
              </button>
            )
          })}
        </div>
      </div>

      <div className="screen-px pt-3">
        <div
          className={`rounded-xl p-3 mb-3 flex justify-between items-center border
          ${isOpen ? 'bg-[#22c55e]/8 border-[#22c55e]/25' : isBlocked ? 'bg-copa-surf2/50 dark:bg-[#172438]/50 border-copa-border dark:border-[#1e2f45]' : 'bg-transparent border-copa-muted dark:border-[#243347]'}`}
        >
          <div>
            <div
              className={`text-xs font-bold ${isOpen ? 'text-[#22c55e]' : isBlocked ? 'text-copa-sub dark:text-[#64849f]' : 'text-copa-mutedT dark:text-[#3a5270]'}`}
            >
              {isOpen
                ? deadlineLabel
                  ? `✏️ Apostas abertas — edite até ${deadlineLabel}`
                  : '✏️ Apostas abertas — edite seus palpites'
                : isBlocked
                  ? '🔒 Fase encerrada — palpites bloqueados'
                  : '⏳ Fase não disponível ainda'}
            </div>
            <div className="text-[12px] text-copa-sub dark:text-[#64849f] mt-0.5">
              +{SCORING.exactScore} exato · +{SCORING.winnerWithGoal} venc.+gol · +{SCORING.correctWinner} vencedor · +{SCORING.oneGoalCorrect} 1 gol
            </div>
          </div>
          <StageBadge status={stage.status} />
        </div>
      </div>

      {stage.status === 'DISABLED' && (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 screen-px">
          <span className="text-4xl">🔜</span>
          <div className="text-sm font-bold text-copa-text dark:text-[#f0f6ff]">{stage.name}</div>
          <div className="text-xs text-copa-sub dark:text-[#64849f] text-center">
            Esta fase será liberada após a conclusão da fase anterior.
          </div>
        </div>
      )}

      {stage.status !== 'DISABLED' && (
        <div className="flex-1 overflow-y-auto screen-px">
          {stageMatches.length === 0 && (
            <p className="text-xs text-copa-sub dark:text-[#64849f] text-center py-6">
              Nenhum jogo nesta fase.
            </p>
          )}
          <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-1">
          {stageMatches.map((m, i) => {
            const bet = isOpen ? bets[m.id] : myBets[m.id]
            const filled2 = isOpen && bet && bet.h !== '' && bet.a !== ''
            const res =
              isBlocked && bet && bet.h !== '' && bet.a !== '' && m.hs !== null
                ? getResult(bet as { h: number; a: number }, m.hs, m.as!)
                : null
            return (
              <div
                key={m.id}
                style={{
                  animationDelay: `${i * 55}ms`,
                  ...(res ? { borderLeftColor: res === 'exact' ? '#22c55e' : '#f59e0b' } : {}),
                }}
                className={`animate-fade-up rounded-2xl border p-4 mb-0 relative overflow-hidden bg-copa-surface dark:bg-[#111d2e] transition-colors
                  ${filled2 ? 'border-[#00e5ff]/40' : 'border-copa-border dark:border-[#1e2f45]'}
                  ${res ? 'border-l-2' : ''}`}
              >
                {filled2 && <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-[#00e5ff] rounded-l-none" />}
                <div className="flex justify-between items-center mb-3">
                  <span className="text-[12px] font-semibold text-copa-sub dark:text-[#64849f]">
                    Jogo {i + 1} · {m.date.slice(8)}/{m.date.slice(5, 7)} · {m.time}
                  </span>
                  {res && (
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${RESULT_COLOR[res]}`}>
                      {RESULT_LABEL[res]}
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-[1fr_auto_1fr] gap-2 items-center">
                  <div className="text-center">
                    <div className="text-3xl mb-1 font-bold text-copa-acc dark:text-[#00e5ff]">{m.hf}</div>
                    <div className="text-xs font-bold text-copa-text dark:text-[#f0f6ff]">{m.home}</div>
                  </div>
                  <div className="text-center">
                    {isBlocked && m.hs !== null && (
                      <div className="font-display text-lg text-copa-sub dark:text-[#64849f] tracking-widest mb-1">
                        {m.hs}–{m.as}
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <input
                        disabled={!isOpen}
                        type="number"
                        min={0}
                        max={20}
                        value={isOpen ? (bets[m.id]?.h ?? '') : (bet?.h ?? '')}
                        onChange={(e) =>
                          isOpen &&
                          setBets((b) => ({
                            ...b,
                            [m.id]: {
                              ...b[m.id],
                              h: e.target.value === '' ? '' : Number(e.target.value),
                            },
                          }))
                        }
                        className={`w-9 h-10 rounded-lg text-center font-display text-xl border transition-colors outline-none
                          ${isOpen ? 'bg-copa-surf2 dark:bg-[#172438]' : 'bg-copa-muted/30 dark:bg-[#243347]/30'}
                          ${isOpen && bets[m.id]?.h !== '' ? 'border-[#00e5ff]/60 text-[#00e5ff]' : 'border-copa-border dark:border-[#1e2f45] text-copa-sub dark:text-[#64849f]'}
                          disabled:cursor-default`}
                      />
                      <span className="text-copa-sub dark:text-[#64849f] font-bold">×</span>
                      <input
                        disabled={!isOpen}
                        type="number"
                        min={0}
                        max={20}
                        value={isOpen ? (bets[m.id]?.a ?? '') : (bet?.a ?? '')}
                        onChange={(e) =>
                          isOpen &&
                          setBets((b) => ({
                            ...b,
                            [m.id]: {
                              ...b[m.id],
                              a: e.target.value === '' ? '' : Number(e.target.value),
                            },
                          }))
                        }
                        className={`w-9 h-10 rounded-lg text-center font-display text-xl border transition-colors outline-none
                          ${isOpen ? 'bg-copa-surf2 dark:bg-[#172438]' : 'bg-copa-muted/30 dark:bg-[#243347]/30'}
                          ${isOpen && bets[m.id]?.a !== '' ? 'border-[#00e5ff]/60 text-[#00e5ff]' : 'border-copa-border dark:border-[#1e2f45] text-copa-sub dark:text-[#64849f]'}
                          disabled:cursor-default`}
                      />
                    </div>
                    <div className="text-[11px] text-copa-mutedT dark:text-[#3a5270] mt-1 text-center">palpite</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl mb-1 font-bold text-copa-acc dark:text-[#00e5ff]">{m.af}</div>
                    <div className="text-xs font-bold text-copa-text dark:text-[#f0f6ff]">{m.away}</div>
                  </div>
                </div>
              </div>
            )
          })}
          </div>
          <div className="h-2" />
        </div>
      )}

      {isOpen && (
        <div className="screen-px py-3 border-t border-copa-border dark:border-[#1e2f45] bg-copa-bg/95 dark:bg-[#070d18]/95 md:max-w-2xl md:mx-auto md:w-full md:rounded-t-2xl md:border-x">
          <div className="flex justify-between text-xs mb-2">
            <span className="text-copa-sub dark:text-[#64849f] font-semibold">Palpites preenchidos</span>
            <span
              className={`font-bold ${filled === stageMatches.length ? 'text-[#22c55e]' : 'text-copa-sub dark:text-[#64849f]'}`}
            >
              {filled}/{stageMatches.length}
            </span>
          </div>
          <Progress
            value={stageMatches.length ? (filled / stageMatches.length) * 100 : 0}
            className="mb-3"
            indicatorClassName={filled === stageMatches.length ? 'bg-[#22c55e]' : 'bg-[#00e5ff]'}
          />
          {saveError && <p className="text-xs text-red-400 mb-2">{saveError}</p>}
          <button
            onClick={save}
            disabled={filled === 0 || saving}
            className={`w-full h-11 rounded-xl font-display text-lg tracking-wider border transition-all
              ${saved ? 'bg-transparent border-[#22c55e] text-[#22c55e]' : saving ? 'bg-[#00e5ff]/10 border-[#00e5ff] text-[#00e5ff]' : filled === 0 ? 'bg-copa-muted/30 border-copa-border dark:border-[#1e2f45] text-copa-sub dark:text-[#64849f] cursor-not-allowed' : 'bg-[#00e5ff] border-[#00e5ff] text-[#070d18] hover:opacity-90'}`}
          >
            {saving ? 'SALVANDO…' : saved ? '✓ APOSTAS SALVAS!' : filled === 0 ? 'PREENCHA OS PALPITES' : `SALVAR ${filled} PALPITE${filled > 1 ? 'S' : ''}`}
          </button>
        </div>
      )}
    </div>
  )
}
