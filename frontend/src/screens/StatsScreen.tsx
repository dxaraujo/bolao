import { useMemo } from 'react'
import { useAppData } from '@/context/AppDataContext'
import { betResult } from '@/lib/bet'
import { LoadingState, ErrorState } from '@/components/shared/LoadingState'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

const USER_COLORS = ['#00e5ff', '#f59e0b', '#a78bfa', '#22c55e', '#ef4444', '#64849f', '#ec4899', '#14b8a6']

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
  const { me, users, stages, matches, allBets, loading, error, refresh } = useAppData()

  const finishedMatches = useMemo(() => matches.filter((m) => m.status === 'finished'), [matches])

  const groupStats = useMemo(() => {
    let exact = 0
    let correct = 0
    let wrong = 0
    for (const m of finishedMatches) {
      const matchBets = allBets[m.id] || {}
      for (const u of users) {
        const r = betResult(matchBets[u.id], m)
        if (r === 'exact') exact++
        else if (r === 'correct') correct++
        else if (r === 'wrong') wrong++
      }
    }
    const total = exact + correct + wrong
    return { exact, correct, wrong, total }
  }, [finishedMatches, allBets, users])

  const leader = users[0]

  const accuracyByStage = useMemo(() => {
    const blocked = stages.filter((s) => s.status === 'BLOCKED')
    return blocked.map((stage) => {
      const stageMatches = finishedMatches.filter((m) => m.matchStage === stage.matchStage)
      const row: Record<string, string | number> = { fase: stage.short }
      for (const u of users) {
        let hits = 0
        let total = 0
        for (const m of stageMatches) {
          const bet = allBets[m.id]?.[u.id]
          const r = betResult(bet, m)
          if (r === 'pending') continue
          total++
          if (r === 'exact' || r === 'correct') hits++
        }
        row[u.name] = total > 0 ? Math.round((hits / total) * 100) : 0
      }
      return row
    })
  }, [stages, finishedMatches, allBets, users])

  if (loading) return <LoadingState />
  if (error) return <ErrorState message={error} onRetry={refresh} />

  const exactPct = groupStats.total ? Math.round((groupStats.exact / groupStats.total) * 100) : 0
  const correctPct = groupStats.total ? Math.round((groupStats.correct / groupStats.total) * 100) : 0
  const wrongPct = groupStats.total ? Math.round((groupStats.wrong / groupStats.total) * 100) : 0
  const groupAccuracy = groupStats.total
    ? Math.round(((groupStats.exact + groupStats.correct) / groupStats.total) * 100)
    : 0

  return (
    <div className="flex-1 overflow-y-auto screen-px pt-4 pb-2">
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 mb-4">
        {(
          [
            { icon: '⚽', label: 'Jogos Finalizados', val: String(finishedMatches.length), color: '#00e5ff' },
            { icon: '🎯', label: 'Placares Exatos', val: String(groupStats.exact), color: '#22c55e' },
            { icon: '✅', label: 'Resultados Certos', val: String(groupStats.correct), color: '#f59e0b' },
            { icon: '👑', label: 'Líder do Grupo', val: leader?.name ?? '—', color: '#a78bfa' },
          ] as const
        ).map(({ icon, label, val, color }) => (
          <div
            key={label}
            className="rounded-2xl border border-copa-border dark:border-[#1e2f45] bg-copa-surface dark:bg-[#111d2e] p-4"
          >
            <div className="text-2xl mb-2">{icon}</div>
            <div className="font-display text-2xl leading-none mb-1 truncate" style={{ color }}>
              {val}
            </div>
            <div className="text-[9px] text-copa-sub dark:text-[#64849f] uppercase tracking-wide font-semibold">
              {label}
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-copa-border dark:border-[#1e2f45] bg-copa-surface dark:bg-[#111d2e] p-4 mb-3">
        <div className="text-[10px] font-bold text-copa-sub dark:text-[#64849f] tracking-widest uppercase mb-4">
          Desempenho por Jogador
        </div>
        {users.map((u, i) => {
          const total = u.exact + u.correct
          const pct = total > 0 ? Math.round((u.exact / total) * 100) : 0
          const color = USER_COLORS[i % USER_COLORS.length]
          const isMe = me?.id === u.id
          return (
            <div key={u.id} className="mb-3 last:mb-0">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-xs font-semibold text-copa-text dark:text-[#f0f6ff] flex items-center gap-1.5">
                  {u.name}
                  {isMe && (
                    <span className="text-[8px] font-bold text-[#00e5ff] bg-[#00e5ff]/10 px-1 rounded">Você</span>
                  )}
                </span>
                <span className="text-xs font-bold" style={{ color }}>
                  {u.exact}E · {u.correct}R · {u.pts}pts
                </span>
              </div>
              <div className="h-2 rounded-full bg-copa-muted dark:bg-[#243347] overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${Math.min(pct, 100)}%`, background: `linear-gradient(90deg,${color}88,${color})` }}
                />
              </div>
            </div>
          )
        })}
      </div>

      {accuracyByStage.length > 0 && (
        <div className="rounded-2xl border border-copa-border dark:border-[#1e2f45] bg-copa-surface dark:bg-[#111d2e] p-4 mb-3">
          <div className="text-[10px] font-bold text-copa-sub dark:text-[#64849f] tracking-widest uppercase mb-4">
            Acerto por Fase (%)
          </div>
          <ResponsiveContainer width="100%" height={180} className="min-h-[150px] sm:min-h-[180px]">
            <LineChart data={accuracyByStage}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,132,159,.15)" vertical={false} />
              <XAxis
                dataKey="fase"
                tick={{ fontSize: 9, fill: '#64849f', fontFamily: 'Outfit' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 9, fill: '#64849f', fontFamily: 'Outfit' }}
                axisLine={false}
                tickLine={false}
                width={24}
                domain={[0, 100]}
              />
              <Tooltip content={<ChartTooltip />} />
              {users.map((u, i) => (
                <Line
                  key={u.id}
                  type="monotone"
                  dataKey={u.name}
                  stroke={USER_COLORS[i % USER_COLORS.length]}
                  strokeWidth={2}
                  dot={{ r: 3, fill: USER_COLORS[i % USER_COLORS.length], strokeWidth: 0 }}
                  activeDot={{ r: 5 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="rounded-2xl border border-copa-border dark:border-[#1e2f45] bg-copa-surface dark:bg-[#111d2e] p-4 mb-2">
        <div className="text-[10px] font-bold text-copa-sub dark:text-[#64849f] tracking-widest uppercase mb-4">
          Distribuição Total do Grupo
        </div>
        <div className="flex gap-4 items-center">
          <svg width={88} height={88} viewBox="0 0 36 36" className="flex-shrink-0">
            <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(100,132,159,.15)" strokeWidth="4" />
            <circle
              cx="18"
              cy="18"
              r="15.9"
              fill="none"
              stroke="#22c55e"
              strokeWidth="4"
              strokeDasharray={`${exactPct} ${100 - exactPct}`}
              strokeDashoffset="25"
              strokeLinecap="round"
            />
            <circle
              cx="18"
              cy="18"
              r="15.9"
              fill="none"
              stroke="#f59e0b"
              strokeWidth="4"
              strokeDasharray={`${correctPct} ${100 - correctPct}`}
              strokeDashoffset={25 - exactPct}
              strokeLinecap="round"
            />
            <text x="18" y="18.5" textAnchor="middle" fontSize="6.5" fontWeight="700" fill="currentColor" fontFamily="Bebas Neue">
              {groupAccuracy}%
            </text>
            <text x="18" y="23.5" textAnchor="middle" fontSize="3.5" fill="#64849f" fontFamily="Outfit">
              acerto
            </text>
          </svg>
          <div className="flex-1 space-y-2.5">
            {(
              [
                ['#22c55e', 'Placar Exato', `${exactPct}%`],
                ['#f59e0b', 'Resultado Certo', `${correctPct}%`],
                ['#ef4444', 'Errou', `${wrongPct}%`],
              ] as const
            ).map(([c, l, v]) => (
              <div key={l}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] text-copa-sub dark:text-[#64849f] flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: c }} />
                    {l}
                  </span>
                  <span className="text-[10px] font-bold" style={{ color: c }}>
                    {v}
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-copa-muted dark:bg-[#243347] overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: v, background: c }} />
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
