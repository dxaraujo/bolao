import { useCallback, useMemo, useState } from 'react'
import { api } from '@/api/client'
import type { ApiBet, ApiBetUser } from '@/api/types'
import { useAppData } from '@/context/AppDataContext'
import { isPopulatedUser, resolveBetDisplay, summaryBucketFromBet, type BetSummaryBucket } from '@/lib/bet'
import { Avatar } from '@/components/shared/Avatar'
import { LoadingState, ErrorState } from '@/components/shared/LoadingState'
import type { User } from '@/types'

function toAvatarUser(user: ApiBetUser): Pick<User, 'id' | 'name' | 'avatar' | 'picture'> {
  return {
    id: user._id,
    name: user.name,
    picture: user.picture || undefined,
    avatar: user.picture ? '' : user.name.charAt(0).toUpperCase(),
  }
}

function buildSummary(items: ApiBet[]) {
  return items.reduce(
    (acc, item) => {
      const bucket = summaryBucketFromBet(item)
      if (bucket) acc[bucket] = (acc[bucket] || 0) + 1
      return acc
    },
    {} as Record<BetSummaryBucket, number>,
  )
}

export function BolaoScreen() {
  const { me, stages, matches, loading, error, refresh } = useAppData()
  const blocked = useMemo(() => stages.filter((s) => s.status === 'BLOCKED'), [stages])
  const [si, setSi] = useState(0)
  const [expanded, setExp] = useState<Record<string, boolean>>({})
  const [betsCache, setBetsCache] = useState<Record<string, ApiBet[]>>({})
  const [loadingMatch, setLoadingMatch] = useState<Record<string, boolean>>({})
  const [matchErrors, setMatchErrors] = useState<Record<string, string>>({})

  const stage = blocked[si]
  const stageMatches = useMemo(
    () =>
      stage
        ? matches.filter((m) => m.matchStage === stage.matchStage && m.status === 'finished')
        : [],
    [matches, stage],
  )

  const loadMatchBets = useCallback(async (matchId: string) => {
    if (betsCache[matchId] || loadingMatch[matchId]) return
    setLoadingMatch((l) => ({ ...l, [matchId]: true }))
    setMatchErrors((e) => {
      const next = { ...e }
      delete next[matchId]
      return next
    })
    try {
      const data = await api.getBetsByMatch(matchId)
      setBetsCache((c) => ({ ...c, [matchId]: data }))
    } catch (e) {
      setMatchErrors((err) => ({
        ...err,
        [matchId]: e instanceof Error ? e.message : 'Erro ao carregar palpites',
      }))
    } finally {
      setLoadingMatch((l) => ({ ...l, [matchId]: false }))
    }
  }, [betsCache, loadingMatch])

  async function toggle(id: string) {
    const opening = !expanded[id]
    setExp((e) => ({ ...e, [id]: opening }))
    if (opening) await loadMatchBets(id)
  }

  if (loading) return <LoadingState />
  if (error) return <ErrorState message={error} onRetry={refresh} />

  if (blocked.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-xs text-copa-sub dark:text-[#64849f] px-5 text-center">
        Nenhuma fase encerrada com palpites revelados ainda.
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="screen-px pt-3 pb-0 bg-gradient-to-b from-copa-bg2 dark:from-[#0d1526] to-transparent border-b border-copa-border dark:border-[#1e2f45]">
        <div className="text-[10px] font-bold text-copa-sub dark:text-[#64849f] tracking-widest uppercase mb-2.5">
          Palpites encerrados
        </div>
        <div className="flex gap-2 overflow-x-auto pb-3">
          {blocked.map((s, i) => {
            const cnt = matches.filter(
              (m) => m.matchStage === s.matchStage && m.status === 'finished',
            ).length
            const active = si === i
            return (
              <button
                key={s.matchStage}
                onClick={() => {
                  setSi(i)
                  setExp({})
                }}
                className={`flex-shrink-0 flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-bold border transition-all
                  ${active ? 'bg-[#00e5ff]/15 border-[#00e5ff]/50 text-copa-acc dark:text-[#00e5ff]' : 'border-copa-border dark:border-[#1e2f45] text-copa-sub dark:text-[#64849f] hover:border-copa-borderB dark:hover:border-[#253a58]'}`}
              >
                {s.short}
                <span
                  className={`text-[9px] font-bold px-1.5 py-0 rounded ${active ? 'bg-[#00e5ff]/20 text-[#00e5ff]' : 'bg-copa-muted dark:bg-[#243347] text-copa-mutedT dark:text-[#3a5270]'}`}
                >
                  {cnt}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto screen-px pt-4">
        {stageMatches.length === 0 && (
          <p className="text-xs text-copa-sub dark:text-[#64849f] text-center py-6">
            Nenhum jogo finalizado nesta fase.
          </p>
        )}
        {stageMatches.map((m, mi) => {
          const isOpen = expanded[m.id]
          const items = betsCache[m.id]
          const summary: Partial<Record<BetSummaryBucket, number>> = items ? buildSummary(items) : {}
          const isLoadingBets = loadingMatch[m.id]
          const matchError = matchErrors[m.id]

          return (
            <div
              key={m.id}
              style={{ animationDelay: `${mi * 55}ms` }}
              className="animate-fade-up rounded-2xl border border-copa-border dark:border-[#1e2f45] bg-copa-surface dark:bg-[#111d2e] mb-3 overflow-hidden"
            >
              <div
                className="p-4 cursor-pointer hover:bg-copa-surf2/50 dark:hover:bg-[#172438]/50 transition-colors"
                onClick={() => void toggle(m.id)}
              >
                <div className="flex justify-between items-center mb-3">
                  <span className="text-[10px] font-semibold text-copa-sub dark:text-[#64849f]">
                    {m.date.slice(8)}/{m.date.slice(5, 7)} · {m.time}
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      {(
                        [
                          ['exact', '#22c55e'],
                          ['correct', '#f59e0b'],
                          ['wrong', '#ef4444'],
                        ] as const
                      ).map(
                        ([r, c]) =>
                          (summary[r] || 0) > 0 && (
                            <span
                              key={r}
                              className="text-[9px] font-bold px-1.5 py-0.5 rounded"
                              style={{ color: c, background: `${c}15` }}
                            >
                              {summary[r]}
                            </span>
                          ),
                      )}
                    </div>
                    <span
                      className="text-copa-sub dark:text-[#64849f] text-sm transition-transform duration-200"
                      style={{ display: 'inline-block', transform: isOpen ? 'rotate(180deg)' : 'none' }}
                    >
                      ▾
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-[1fr_auto_1fr] gap-2 items-center">
                  <div className="text-center">
                    <div className="text-3xl mb-1 font-bold text-copa-acc dark:text-[#00e5ff]">{m.hf}</div>
                    <div className="text-xs font-bold text-copa-text dark:text-[#f0f6ff]">{m.home}</div>
                  </div>
                  <div className="text-center min-w-[60px]">
                    <div className="text-[10px] text-copa-sub dark:text-[#64849f] mb-1">Resultado</div>
                    <div className="font-display text-3xl text-copa-text dark:text-[#f0f6ff] tracking-widest leading-none">
                      {m.hs}&nbsp;–&nbsp;{m.as}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl mb-1 font-bold text-copa-acc dark:text-[#00e5ff]">{m.af}</div>
                    <div className="text-xs font-bold text-copa-text dark:text-[#f0f6ff]">{m.away}</div>
                  </div>
                </div>
              </div>

              {isOpen && (
                <div className="border-t border-copa-border dark:border-[#1e2f45] animate-fade-up">
                  {isLoadingBets && (
                    <div className="flex items-center justify-center gap-2 py-8">
                      <span className="w-5 h-5 rounded-full border-2 border-copa-border dark:border-t-[#00e5ff] animate-spin2" />
                      <span className="text-xs text-copa-sub dark:text-[#64849f]">Carregando palpites…</span>
                    </div>
                  )}
                  {matchError && !isLoadingBets && (
                    <div className="px-4 py-6 text-center">
                      <p className="text-xs text-red-400 mb-2">{matchError}</p>
                      <button
                        onClick={() => void loadMatchBets(m.id)}
                        className="text-xs font-bold text-[#00e5ff]"
                      >
                        Tentar novamente
                      </button>
                    </div>
                  )}
                  {items && !isLoadingBets && (
                    <>
                      <div className="overflow-x-auto">
                      <div className="grid grid-cols-[minmax(120px,1fr)_64px_96px_56px] sm:grid-cols-[minmax(140px,1fr)_72px_104px_64px] min-w-[320px] px-4 py-2 bg-copa-surf2 dark:bg-[#172438] border-b border-copa-border dark:border-[#1e2f45]">
                        {['Jogador', 'Palpite', 'Resultado', 'Pts'].map((h) => (
                          <div
                            key={h}
                            className="text-[9px] font-bold text-copa-sub dark:text-[#64849f] tracking-wide uppercase text-center first:text-left"
                          >
                            {h}
                          </div>
                        ))}
                      </div>
                      {items.map((bet) => {
                        if (!isPopulatedUser(bet.user)) return null
                        const user = bet.user
                        const display = resolveBetDisplay(bet)
                        const isMeUser = me?.id === user._id
                        const hasBet = bet.homeTeamScore != null && bet.awayTeamScore != null
                        const pts = bet.totalPointsEarned ?? 0
                        return (
                          <div
                            key={bet._id ?? user._id}
                            className={`grid grid-cols-[minmax(120px,1fr)_64px_96px_56px] sm:grid-cols-[minmax(140px,1fr)_72px_104px_64px] min-w-[320px] px-4 py-2.5 items-center border-b border-copa-border dark:border-[#1e2f45] last:border-0
                              ${isMeUser ? 'bg-[#00e5ff]/5' : ''}`}
                          >
                            <div className="flex items-center gap-2">
                              <Avatar user={toAvatarUser(user)} size="sm" highlight={isMeUser} />
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <span className="text-xs font-semibold text-copa-text dark:text-[#f0f6ff]">
                                    {user.name}
                                  </span>
                                  {isMeUser && (
                                    <span className="text-[8px] font-bold text-[#00e5ff] bg-[#00e5ff]/10 px-1 rounded">
                                      Você
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="text-center">
                              {hasBet ? (
                                <span className="font-display text-lg leading-none" style={{ color: display.color }}>
                                  {bet.homeTeamScore}–{bet.awayTeamScore}
                                </span>
                              ) : (
                                <span className="text-xs text-copa-mutedT dark:text-[#3a5270]">—</span>
                              )}
                            </div>
                            <div className="text-center">
                              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${display.tw}`}>
                                {display.label}
                              </span>
                            </div>
                            <div className="text-center">
                              <span
                                className="font-display text-lg leading-none"
                                style={{ color: pts > 0 ? display.color : '#3a5270' }}
                              >
                                {pts > 0 ? `+${pts}` : pts}
                              </span>
                            </div>
                          </div>
                        )
                      })}
                      </div>
                      <div className="flex justify-between items-center px-4 py-2 bg-copa-surf2 dark:bg-[#172438]">
                        <span className="text-[10px] text-copa-sub dark:text-[#64849f] font-semibold">
                          {items.length} palpite{items.length !== 1 ? 's' : ''}
                        </span>
                        <div className="flex gap-3">
                          {(
                            [
                              ['🎯', summary.exact || 0, '#22c55e'],
                              ['✓', summary.correct || 0, '#f59e0b'],
                              ['✗', summary.wrong || 0, '#ef4444'],
                            ] as const
                          ).map(([ic, n, c]) => (
                            <span key={ic} className="text-[10px] font-bold flex items-center gap-1" style={{ color: c }}>
                              {ic} {n}
                            </span>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          )
        })}
        <div className="h-2" />
      </div>
    </div>
  )
}
