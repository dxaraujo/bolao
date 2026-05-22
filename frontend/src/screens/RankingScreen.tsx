import { useMemo } from 'react'
import { useAppData } from '@/context/AppDataContext'
import { SCORING } from '@/lib/enums'
import { Avatar } from '@/components/shared/Avatar'
import { LoadingState, ErrorState } from '@/components/shared/LoadingState'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

const MEDALS = ['🥇', '🥈', '🥉']
const PODIUM_HEIGHTS = [56, 80, 44]
const PODIUM_COLORS = ['#64849f', '#f59e0b', '#00e5ff']
const PODIUM_MEDALS = ['🥈', '🥇', '🥉']

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl border border-copa-border dark:border-[#1e2f45] bg-copa-surface dark:bg-[#111d2e] px-3 py-2">
      <div className="text-xs font-bold text-copa-text dark:text-[#f0f6ff] mb-1">{label}</div>
      <div className="text-xs text-[#00e5ff]">{payload[0]?.value} pts</div>
      <div className="text-xs text-[#f59e0b]">{payload[1]?.value} exatos</div>
    </div>
  )
}

export function RankingScreen() {
  const { me, users, loading, error, refresh } = useAppData()

  const maxPts = users[0]?.pts ?? 1
  const podiumOrder = useMemo(() => {
    if (users.length < 3) return users
    return [users[1], users[0], users[2]]
  }, [users])

  const chartData = users.map((u) => ({ name: u.name, pts: u.pts, exact: u.exact }))

  if (loading) return <LoadingState />
  if (error) return <ErrorState message={error} onRetry={refresh} />

  return (
    <div className="flex-1 overflow-y-auto screen-px pt-4 pb-2">
      <div className="lg:grid lg:grid-cols-2 lg:gap-6 lg:items-start">
      {users.length >= 3 && (
        <div className="rounded-2xl overflow-hidden border border-copa-border dark:border-[#1e2f45] bg-copa-surface dark:bg-[#111d2e] mb-4 lg:mb-0">
          <div className="px-4 pt-4 pb-0 bg-gradient-to-br from-[#00e5ff]/8 to-[#f59e0b]/5">
            <div className="text-[10px] font-bold text-copa-sub dark:text-[#64849f] tracking-widest uppercase mb-4">
              Pódio
            </div>
            <div className="flex items-end justify-center">
              {podiumOrder.map((u, i) => (
                <div key={u.id} className="flex-1 text-center">
                  <div className="text-sm mb-1">{PODIUM_MEDALS[i]}</div>
                  <Avatar user={u} size="md" className="mx-auto mb-1" />
                  <div className="text-[10px] font-bold text-copa-text dark:text-[#f0f6ff]">{u.name}</div>
                  <div className="font-display text-sm mb-1.5" style={{ color: PODIUM_COLORS[i] }}>
                    {u.pts}pts
                  </div>
                  <div
                    style={{
                      height: PODIUM_HEIGHTS[i],
                      background: `${PODIUM_COLORS[i]}18`,
                      borderTop: `2px solid ${PODIUM_COLORS[i]}44`,
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="mb-4 lg:mb-0">
        <div className="text-[10px] font-bold text-copa-sub dark:text-[#64849f] tracking-widest uppercase mb-3">
          Classificação Completa
        </div>
        {users.map((u, i) => {
          const isMe = me?.id === u.id
          return (
            <div
              key={u.id}
              style={{ animationDelay: `${i * 50}ms` }}
              className={`animate-fade-up rounded-xl p-3 mb-2 flex items-center gap-3 border transition-colors
                ${isMe ? 'border-[#00e5ff]/30 bg-gradient-to-r from-[#00e5ff]/8 to-copa-surface dark:from-[#00e5ff]/8 dark:to-[#111d2e]' : 'border-copa-border dark:border-[#1e2f45] bg-copa-surface dark:bg-[#111d2e]'}`}
            >
              <div className="w-6 text-center text-base">
                {i < 3 ? (
                  MEDALS[i]
                ) : (
                  <span className="text-xs font-bold text-copa-sub dark:text-[#64849f]">{i + 1}°</span>
                )}
              </div>
              <Avatar user={u} size="md" highlight={isMe} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <span className="text-xs font-bold text-copa-text dark:text-[#f0f6ff]">{u.name}</span>
                  {isMe && (
                    <span className="text-[8px] font-bold text-[#00e5ff] bg-[#00e5ff]/10 px-1.5 py-0 rounded">
                      Você
                    </span>
                  )}
                </div>
                <div className="h-1.5 rounded-full bg-copa-muted dark:bg-[#243347] overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${(u.pts / maxPts) * 100}%`,
                      background: i === 0 ? '#f59e0b' : i === 1 ? '#64849f' : i === 2 ? '#00e5ff' : '#3a5270',
                    }}
                  />
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="font-display text-xl leading-none" style={{ color: i === 0 ? '#f59e0b' : 'inherit' }}>
                  {u.pts}
                </div>
                <div className="text-[9px] text-copa-sub dark:text-[#64849f] uppercase">pts</div>
              </div>
            </div>
          )
        })}
      </div>
      </div>

      {users.length > 0 && (
        <div className="rounded-2xl border border-copa-border dark:border-[#1e2f45] bg-copa-surface dark:bg-[#111d2e] p-4 mb-4">
          <div className="text-[10px] font-bold text-copa-sub dark:text-[#64849f] tracking-widest uppercase mb-4">
            Pontuação e Placares Exatos
          </div>
          <ResponsiveContainer width="100%" height={180} className="min-h-[150px] sm:min-h-[180px]">
            <BarChart data={chartData} barCategoryGap="30%">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,132,159,.15)" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 9, fill: '#64849f', fontFamily: 'Outfit' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 9, fill: '#64849f', fontFamily: 'Outfit' }}
                axisLine={false}
                tickLine={false}
                width={22}
              />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="pts" fill="#00e5ff" radius={[4, 4, 0, 0]} />
              <Bar dataKey="exact" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="rounded-2xl border border-copa-border dark:border-[#1e2f45] bg-copa-surface dark:bg-[#111d2e] p-4 mb-2">
        <div className="text-[10px] font-bold text-copa-sub dark:text-[#64849f] tracking-widest uppercase mb-3">
          Tabela de Pontuação
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          {(
            [
              ['#22c55e', `+${SCORING.exactScore}`, 'Placar Exato'],
              ['#f59e0b', `+${SCORING.winnerWithGoal}`, 'Venc. + Gol'],
              ['#eab308', `+${SCORING.correctWinner}`, 'Vencedor'],
              ['#a78bfa', `+${SCORING.oneGoalCorrect}`, '1 Gol'],
              ['#ef4444', String(SCORING.wrong), 'Errou'],
            ] as const
          ).map(([c, v, l]) => (
            <div key={l} className="rounded-xl p-3 text-center border" style={{ background: `${c}12`, borderColor: `${c}30` }}>
              <div className="font-display text-2xl leading-none" style={{ color: c }}>
                {v}
              </div>
              <div className="text-[9px] text-copa-sub dark:text-[#64849f] mt-1 font-semibold">{l}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="h-2" />
    </div>
  )
}
