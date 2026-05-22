import type { UserAccuracy } from '@bolao/shared'

import { Card } from '@/components/ui/card'

interface AccuracyByUserProps {
	users: UserAccuracy[]
}

const USER_COLORS = [
	'rgb(var(--acc))',
	'rgb(var(--gold))',
	'rgb(var(--purple))',
	'rgb(var(--green))',
	'rgb(var(--red))',
	'rgb(var(--sub))',
]

const LEGEND: Array<{ icon: string; label: string; color: string }> = [
	{ icon: '🎯', label: 'Exato', color: 'rgb(var(--green))' },
	{ icon: '⚽', label: 'Venc+Gol', color: 'rgb(var(--acc))' },
	{ icon: '✓', label: 'Vencedor', color: 'rgb(var(--gold))' },
	{ icon: '〜', label: 'Um Gol', color: 'rgb(var(--purple))' },
	{ icon: '✗', label: 'Errou', color: 'rgb(var(--red))' },
]

export function AccuracyByUser({ users }: AccuracyByUserProps) {
	return (
		<Card className="animate-fade-up p-3">
			<div className="mb-3 text-[11px] font-bold uppercase tracking-wider text-sub">% Acerto por jogador</div>
			<div className="flex flex-col gap-3">
				{users.map((u, i) => {
					const color = USER_COLORS[i % USER_COLORS.length]
					const pct = u.totalBets === 0 ? 0 : (u.exactScore / u.totalBets) * 100
					return (
						<div key={u._id}>
							<div className="flex items-center justify-between text-xs">
								<span className="font-bold">{u.name}</span>
								<span className="font-bold" style={{ color }}>
									{u.exactScore}E · {u.correctBets}R · {u.wrong}X
								</span>
							</div>
							<div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
								<div
									className="h-full rounded-full transition-[width] duration-700 ease-out"
									style={{
										width: `${pct}%`,
										background: `linear-gradient(90deg, ${color}88, ${color})`,
									}}
								/>
							</div>
						</div>
					)
				})}
			</div>
			<div className="mt-3 flex flex-wrap gap-3 border-t border-border pt-2 text-[10px] text-sub">
				{LEGEND.map(({ icon, label, color }) => (
					<span key={label} className="flex items-center gap-1">
						<span className="h-1.5 w-1.5 rounded-full" style={{ background: color }} />
						{icon} {label}
					</span>
				))}
			</div>
		</Card>
	)
}
