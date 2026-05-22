import { useMemo } from 'react'
import { useAppData } from '@/context/AppDataContext'
import {
  aggregateUserOutcomes,
  BET_OUTCOME_META,
  BET_OUTCOME_ORDER,
  betOutcomeFromApi,
  formatUserStatsCompact,
  userHits,
  type BetOutcomeType,
} from '@/lib/bet'
import { SCORING } from '@/lib/enums'
import { LoadingState, ErrorState } from '@/components/shared/LoadingState'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

const USER_COLORS = ['#00e5ff', '#f59e0b', '#a78bfa', '#22c55e', '#ef4444', '#64849f', '#ec4899', '#14b8a6']

function pct(count: number, total: number) {
  return total > 0 ? Math.round((count / total) * 100) : 0
}

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: { dataKey: string; value: number; color: string }[]
  label?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl border border-copa-border dark:border-[#1e2f45] bg-copa-surface dark:bg-[#111d2e] px-3 py-2">
      <div className="text-xs font-bold text-copa-text dark:text-[#f0f6ff] mb-1">{label}</div>
      {payload.map((p) => (
        <div key={p.dataKey} className="text-xs" style={{ color: p.color }}>
          {p.dataKey}: {p.value}%
        </div>
      ))}
    </div>
  )
}

export function StatsScreen() {
  const { me, users, stages, matches, myApiBets, loading, error, refresh } = useAppData()

  const finishedMatches = useMemo(() => matches.filter((m) => m.status === 'finished'), [matches])

  const groupStats = useMemo(() => aggregateUserOutcomes(users), [users])

  const maxUserHits = useMemo(() => Math.max(1, ...users.map(userHits)), [users])

  const leader = users[0]

  const myAccuracyByStage = useMemo(() => {
    if (!me) return []
    const blocked = stages.filter((s) => s.status === 'BLOCKED')
    return blocked
      .map((stage) => {
        const stageMatchIds = new Set(
          finishedMatches.filter((m) => m.matchStage === stage.matchStage).map((m) => m.id),
        )
        let hits = 0
        let total = 0
        for (const bet of myApiBets) {
          const matchId = typeof bet.match === 'string' ? bet.match : bet.match._id
          if (!stageMatchIds.has(matchId)) continue
          if (bet.homeTeamScore == null || bet.awayTeamScore == null) continue
          total++
          if (betOutcomeFromApi(bet)) hits++
        }
        return { fase: stage.short, acerto: pct(hits, total), jogos: total }
      })
      .filter((row) => row.jogos > 0)
  }, [me, stages, finishedMatches, myApiBets])

  const distributionRows = useMemo(
    () =>
      BET_OUTCOME_ORDER.map((key) => {
        const meta = BET_OUTCOME_META[key]
        const count = groupStats.counts[key]
        const points = SCORING[key]
        return {
          key,
          meta,
          count,
          points,
          percent: pct(count, groupStats.total),
        }
      }),
    [groupStats],
  )

  const groupAccuracy = useMemo(() => {
    const hits =
      groupStats.counts.exactScore +
      groupStats.counts.winnerWithGoal +
      groupStats.counts.correctWinner +
      groupStats.counts.oneGoalCorrect
    return pct(hits, groupStats.total)
  }, [groupStats])

  const donutSegments = useMemo(() => {
    let offset = 25
    return distributionRows.map((row) => {
      const segment = { ...row, dashOffset: offset }
      offset -= row.percent
      return segment
    })
  }, [distributionRows])

  if (loading) return <LoadingState />
  if (error) return <ErrorState message={error} onRetry={refresh} />

  const topCards = [
    { icon: '⚽', label: 'Jogos Finalizados', val: String(finishedMatches.length), color: '#00e5ff' },
    ...BET_OUTCOME_ORDER.map((key) => {
      const meta = BET_OUTCOME_META[key]
      return {
        icon: meta.icon,
        label: meta.label,
        val: String(groupStats.counts[key]),
        color: meta.color,
      }
    }),
    { icon: '👑', label: 'Líder do Grupo', val: leader?.name ?? '—', color: '#a78bfa' },
  ]

  return (
    <div className="flex-1 overflow-y-auto screen-px pt-4 pb-2">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 mb-4">
        {topCards.map(({ icon, label, val, color }) => (
          <div
            key={label}
            className="rounded-2xl border border-copa-border dark:border-[#1e2f45] bg-copa-surface dark:bg-[#111d2e] p-4"
          >
            <div className="text-2xl mb-2">{icon}</div>
            <div className="font-display text-2xl leading-none mb-1 truncate" style={{ color }}>
              {val}
            </div>
            <div className="text-[11px] text-copa-sub dark:text-[#64849f] uppercase tracking-wide font-semibold">
              {label}
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-copa-border dark:border-[#1e2f45] bg-copa-surface dark:bg-[#111d2e] p-4 mb-3">
        <div className="text-[12px] font-bold text-copa-sub dark:text-[#64849f] tracking-widest uppercase mb-4">
          Desempenho por Jogador
        </div>
        {users.map((u, i) => {
          const hits = userHits(u)
          const hitPct = pct(hits, maxUserHits)
          const color = USER_COLORS[i % USER_COLORS.length]
          const isMe = me?.id === u.id
          return (
            <div key={u.id} className="mb-4 last:mb-0">
              <div className="flex justify-between items-center mb-1.5 gap-2">
                <span className="text-xs font-semibold text-copa-text dark:text-[#f0f6ff] flex items-center gap-1.5 min-w-0">
                  {u.name}
                  {isMe && (
                    <span className="text-[10px] font-bold text-[#00e5ff] bg-[#00e5ff]/10 px-1 rounded shrink-0">
                      Você
                    </span>
                  )}
                </span>
                <span className="text-[12px] font-bold text-right shrink-0" style={{ color }}>
                  {formatUserStatsCompact(u)} · {u.pts}pts
                </span>
              </div>
              <div className="grid grid-cols-4 gap-1 mb-2">
                {(
                  [
                    ['exactScore', u.exactScore],
                    ['winnerWithGoal', u.winnerWithGoal],
                    ['correctWinner', u.correctWinner],
                    ['oneGoalCorrect', u.oneGoalCorrect],
                  ] as [BetOutcomeType, number][]
                ).map(([key, count]) => {
                  const meta = BET_OUTCOME_META[key]
                  return (
                    <div
                      key={key}
                      className="rounded-lg py-1 text-center border"
                      style={{ background: `${meta.color}12`, borderColor: `${meta.color}30` }}
                    >
                      <div className="text-[12px] font-bold" style={{ color: meta.color }}>
                        {count}
                      </div>
                      <div className="text-[9px] text-copa-sub dark:text-[#64849f] font-semibold uppercase">
                        {meta.short}
                      </div>
                    </div>
                  )
                })}
              </div>
              <div className="h-2 rounded-full bg-copa-muted dark:bg-[#243347] overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${Math.min(hitPct, 100)}%`,
                    background: `linear-gradient(90deg,${color}88,${color})`,
                  }}
                />
              </div>
            </div>
          )
        })}
      </div>

      {myAccuracyByStage.length > 0 && (
        <div className="rounded-2xl border border-copa-border dark:border-[#1e2f45] bg-copa-surface dark:bg-[#111d2e] p-4 mb-3">
          <div className="text-[12px] font-bold text-copa-sub dark:text-[#64849f] tracking-widest uppercase mb-4">
            Seu Acerto por Fase (%)
          </div>
          <ResponsiveContainer width="100%" height={180} className="min-h-[150px] sm:min-h-[180px]">
            <LineChart data={myAccuracyByStage}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,132,159,.15)" vertical={false} />
              <XAxis
                dataKey="fase"
                tick={{ fontSize: 11, fill: '#64849f', fontFamily: 'Outfit' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#64849f', fontFamily: 'Outfit' }}
                axisLine={false}
                tickLine={false}
                width={24}
                domain={[0, 100]}
              />
              <Tooltip content={<ChartTooltip />} />
              <Line
                type="monotone"
                dataKey="acerto"
                stroke="#00e5ff"
                strokeWidth={2}
                dot={{ r: 3, fill: '#00e5ff', strokeWidth: 0 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="rounded-2xl border border-copa-border dark:border-[#1e2f45] bg-copa-surface dark:bg-[#111d2e] p-4 mb-2">
        <div className="text-[12px] font-bold text-copa-sub dark:text-[#64849f] tracking-widest uppercase mb-4">
          Distribuição Total do Grupo
        </div>
        <div className="flex gap-4 items-center">
          <svg width={88} height={88} viewBox="0 0 36 36" className="flex-shrink-0">
            <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(100,132,159,.15)" strokeWidth="4" />
            {donutSegments.map((row) => (
              <circle
                key={row.key}
                cx="18"
                cy="18"
                r="15.9"
                fill="none"
                stroke={row.meta.color}
                strokeWidth="4"
                strokeDasharray={`${row.percent} ${100 - row.percent}`}
                strokeDashoffset={row.dashOffset}
                strokeLinecap="round"
              />
            ))}
            <text
              x="18"
              y="18.5"
              textAnchor="middle"
              fontSize="8"
              fontWeight="700"
              fill="currentColor"
              fontFamily="Bebas Neue"
            >
              {groupAccuracy}%
            </text>
            <text x="18" y="23.5" textAnchor="middle" fontSize="4.5" fill="#64849f" fontFamily="Outfit">
              acerto
            </text>
          </svg>
          <div className="flex-1 space-y-2">
            {distributionRows.map((row) => (
              <div key={row.key}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[12px] text-copa-sub dark:text-[#64849f] flex items-center gap-1.5">
                    <span
                      className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{ background: row.meta.color }}
                    />
                    {row.meta.label}
                    <span className="text-[10px] opacity-70">+{row.points}pts</span>
                  </span>
                  <span className="text-[12px] font-bold" style={{ color: row.meta.color }}>
                    {row.count} ({row.percent}%)
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-copa-muted dark:bg-[#243347] overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${row.percent}%`, background: row.meta.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="h-2" />
    </div>
  )
}
