import { useMemo } from 'react'
import { useAppData } from '@/context/AppDataContext'
import { LiveDot } from '@/components/shared/LiveDot'
import { LoadingState, ErrorState } from '@/components/shared/LoadingState'
import { BET_OUTCOME_META } from '@/lib/bet'
import { formatDeadline } from '@/lib/format'
import type { Match, Screen, Stage } from '@/types'

interface HomeScreenProps {
  onNav: (s: Screen) => void
}

function MatchCard({ m, stages }: { m: Match; stages: Stage[] }) {
  const stage = stages.find((s) => s.matchStage === m.matchStage)
  const isLive = m.status === 'live'
  const done = m.status === 'finished'

  return (
    <div
      className={`rounded-2xl border bg-copa-surface dark:bg-[#111d2e] p-4 mb-0 relative overflow-hidden
      ${isLive ? 'border-red-500/30' : 'border-copa-border dark:border-[#1e2f45]'}`}
    >
      {isLive && <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-red-500 to-transparent" />}
      <div className="flex justify-between items-center mb-3">
        <span className="text-[12px] font-bold text-copa-sub dark:text-[#64849f] uppercase tracking-wide">
          {stage?.short ?? m.matchStage}
        </span>
        <div className="flex items-center gap-1.5">
          {isLive && <LiveDot />}
          <span
            className={`text-[12px] font-bold ${isLive ? 'text-red-400' : done ? 'text-copa-sub dark:text-[#64849f]' : 'text-copa-acc dark:text-[#00e5ff]'}`}
          >
            {isLive ? 'AO VIVO' : done ? 'Encerrado' : `${m.date.slice(8)}/${m.date.slice(5, 7)} · ${m.time}`}
          </span>
        </div>
      </div>
      <div className="grid grid-cols-[1fr_auto_1fr] gap-2 items-center">
        <div className="text-center">
          <div className="text-3xl mb-1 font-bold text-copa-acc dark:text-[#00e5ff]">{m.hf}</div>
          <div className="text-xs font-bold text-copa-text dark:text-[#f0f6ff]">{m.home}</div>
        </div>
        <div className="text-center min-w-[52px]">
          {isLive || done ? (
            <div className="font-display text-3xl text-copa-text dark:text-[#f0f6ff] tracking-widest leading-none">
              {m.hs}&nbsp;–&nbsp;{m.as}
            </div>
          ) : (
            <div className="text-sm font-bold text-copa-muted dark:text-[#243347] tracking-widest">VS</div>
          )}
          {!done && !isLive && <div className="text-[11px] text-copa-mutedT dark:text-[#3a5270] mt-1">{m.time}</div>}
        </div>
        <div className="text-center">
          <div className="text-3xl mb-1 font-bold text-copa-acc dark:text-[#00e5ff]">{m.af}</div>
          <div className="text-xs font-bold text-copa-text dark:text-[#f0f6ff]">{m.away}</div>
        </div>
      </div>
    </div>
  )
}

export function HomeScreen({ onNav }: HomeScreenProps) {
  const { me, users, stages, matches, loading, error, refresh } = useAppData()

  const openStage = useMemo(() => stages.find((s) => s.status === 'OPEN'), [stages])
  const openDeadline = useMemo(
    () => (openStage ? formatDeadline(openStage.deadline) : null),
    [openStage],
  )
  const blockedStages = useMemo(() => stages.filter((s) => s.status === 'BLOCKED'), [stages])

  const openMatches = useMemo(
    () => (openStage ? matches.filter((m) => m.matchStage === openStage.matchStage) : []),
    [matches, openStage],
  )

  const recentMatches = useMemo(() => {
    const lastBlocked = blockedStages[blockedStages.length - 1]
    if (!lastBlocked) return matches.filter((m) => m.status === 'finished').slice(-2)
    return matches
      .filter((m) => m.matchStage === lastBlocked.matchStage && m.status === 'finished')
      .slice(-2)
  }, [matches, blockedStages])

  const myRank = useMemo(() => {
    if (!me) return null
    const idx = users.findIndex((u) => u.id === me.id)
    return idx >= 0 ? idx + 1 : me.ranking
  }, [me, users])

  if (loading) return <LoadingState />
  if (error) return <ErrorState message={error} onRetry={refresh} />
  if (!me) return null

  const rankLabel = myRank === 1 ? '🥇 1°' : myRank === 2 ? '🥈 2°' : myRank === 3 ? '🥉 3°' : `${myRank}°`

  return (
    <div className="flex-1 overflow-y-auto screen-px pt-4 pb-2">
      <div
        className="rounded-2xl p-4 mb-4 relative overflow-hidden
        bg-gradient-to-br from-[#00e5ff]/10 to-[#f59e0b]/8 dark:from-[#00e5ff]/10 dark:to-[#f59e0b]/8
        border border-[#00e5ff]/20 dark:border-[#00e5ff]/20"
      >
        <div className="absolute -right-6 -top-6 w-28 h-28 rounded-full bg-[#00e5ff] opacity-[0.04]" />
        <div className="text-[12px] font-bold text-copa-acc dark:text-[#00e5ff] tracking-widest uppercase mb-2">
          Sua Posição Atual
        </div>
        <div className="flex items-center gap-4 mb-3">
          <div className="font-display text-5xl leading-none text-copa-text dark:text-[#f0f6ff]">
            {rankLabel}
          </div>
          <div>
            <div className="font-display text-3xl text-copa-acc dark:text-[#00e5ff] leading-none">
              {me.pts} <span className="text-base text-copa-sub dark:text-[#64849f]">pts</span>
            </div>
            <div className="text-[12px] text-copa-sub dark:text-[#64849f]">
              de {users.length} participante{users.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {(
            [
              ['exactScore', me.exactScore],
              ['winnerWithGoal', me.winnerWithGoal],
              ['correctWinner', me.correctWinner],
              ['oneGoalCorrect', me.oneGoalCorrect],
            ] as const
          ).map(([key, value]) => {
            const meta = BET_OUTCOME_META[key]
            return (
              <div key={key}>
                <div className="font-display text-xl leading-none" style={{ color: meta.color }}>
                  {value}
                </div>
                <div className="text-[11px] text-copa-sub dark:text-[#64849f] uppercase tracking-wide mt-0.5">
                  {meta.label}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {openStage && openMatches.length > 0 && (
        <div
          onClick={() => onNav('bets')}
          className="cursor-pointer rounded-xl p-3 mb-4 flex justify-between items-center
          bg-[#22c55e]/10 border border-[#22c55e]/25 hover:bg-[#22c55e]/15 transition-colors"
        >
          <div>
            <div className="text-xs font-bold text-[#22c55e]">
              📋 Apostas das {openStage.short} abertas
            </div>
            <div className="text-[12px] text-copa-sub dark:text-[#64849f] mt-0.5">
              {openDeadline ? `Prazo: ${openDeadline} · ` : ''}
              {openMatches.length} jogo{openMatches.length !== 1 ? 's' : ''} · toque para apostar
            </div>
          </div>
          <span className="text-lg text-[#22c55e]">›</span>
        </div>
      )}

      {openMatches.length > 0 && (
        <>
          <div className="text-[12px] font-bold text-copa-sub dark:text-[#64849f] tracking-widest uppercase mb-2.5">
            {openStage?.name ?? 'Fase aberta'}
          </div>
          <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-1">
            {openMatches.map((m) => (
              <MatchCard key={m.id} m={m} stages={stages} />
            ))}
          </div>
        </>
      )}

      {recentMatches.length > 0 && (
        <>
          <div className="text-[12px] font-bold text-copa-sub dark:text-[#64849f] tracking-widest uppercase mt-5 mb-2.5">
            Resultados Recentes
          </div>
          <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-1">
            {recentMatches.map((m) => (
              <MatchCard key={m.id} m={m} stages={stages} />
            ))}
          </div>
        </>
      )}

      {openMatches.length === 0 && recentMatches.length === 0 && (
        <p className="text-xs text-copa-sub dark:text-[#64849f] text-center py-8">
          Nenhuma partida visível no momento.
        </p>
      )}
      <div className="h-2" />
    </div>
  )
}
