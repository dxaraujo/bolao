import type { Distribution } from '@bolao/shared'

import { Card } from '@/components/ui/card'

interface DistributionDonutProps {
	data: Distribution
}

type Segment = { label: string; pct: number; color: string }

export function DistributionDonut({ data }: DistributionDonutProps) {
	const accuracy =
		data.totalEvaluatedBets === 0
			? 0
			: Math.round(
					((data.exact.count + data.winnerWithGoal.count + data.correctWinner.count + data.oneGoalCorrect.count) /
						data.totalEvaluatedBets) *
						100,
				)

	const segments: Segment[] = [
		{ label: 'Placar Exato', pct: data.exact.pct, color: 'rgb(var(--green))' },
		{ label: 'Vencedor + Gol', pct: data.winnerWithGoal.pct, color: 'rgb(var(--acc))' },
		{ label: 'Só Vencedor', pct: data.correctWinner.pct, color: 'rgb(var(--gold))' },
		{ label: 'Um Gol', pct: data.oneGoalCorrect.pct, color: 'rgb(var(--purple))' },
		{ label: 'Errou', pct: data.wrong.pct, color: 'rgb(var(--red))' },
	]

	return (
		<Card className="animate-fade-up p-3">
			<div className="mb-3 text-xs font-bold uppercase tracking-wider text-sub">
				Distribuição total do grupo
			</div>
			<div className="flex items-center gap-3.5">
				<Donut segments={segments} percent={accuracy} />
				<div className="flex flex-1 flex-col gap-2.5">
					{segments.map((s) => (
						<div key={s.label}>
							<div className="mb-1 flex items-center justify-between text-xs">
								<span className="flex items-center gap-1.5 text-sub">
									<span className="h-1.5 w-1.5 rounded-full" style={{ background: s.color }} />
									{s.label}
								</span>
								<span className="font-bold" style={{ color: s.color }}>
									{s.pct}%
								</span>
							</div>
							<div className="h-[5px] w-full overflow-hidden rounded-full bg-muted">
								<div
									className="h-full rounded-full transition-[width] duration-700 ease-out"
									style={{ width: `${s.pct}%`, background: s.color }}
								/>
							</div>
						</div>
					))}
				</div>
			</div>
		</Card>
	)
}

function Donut({ segments, percent }: { segments: Segment[]; percent: number }) {
	const r = 15.9
	const c = 2 * Math.PI * r
	let offset = 0
	return (
		<svg width={88} height={88} viewBox="0 0 36 36" className="shrink-0">
			<circle cx="18" cy="18" r={r} fill="none" stroke="rgb(var(--border))" strokeWidth="4" />
			{segments.map((s) => {
				if (s.pct <= 0) return null
				const len = (c * s.pct) / 100
				const dash = `${len} ${c - len}`
				const dashOffset = -offset
				offset += len
				return (
					<circle
						key={s.label}
						cx="18"
						cy="18"
						r={r}
						fill="none"
						stroke={s.color}
						strokeWidth="4"
						strokeDasharray={dash}
						strokeDashoffset={dashOffset}
						strokeLinecap="butt"
						transform="rotate(-90 18 18)"
					/>
				)
			})}
			<text x="18" y="18.5" textAnchor="middle" fontSize="6.5" fontWeight="700" fill="rgb(var(--text))" fontFamily="Bebas Neue">
				{percent}%
			</text>
			<text x="18" y="23.5" textAnchor="middle" fontSize="3.5" fill="rgb(var(--sub))" fontFamily="Outfit">
				acerto
			</text>
		</svg>
	)
}
