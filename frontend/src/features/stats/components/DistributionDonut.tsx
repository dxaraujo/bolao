import type { Distribution } from '@bolao/shared'

import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

interface DistributionDonutProps {
	data: Distribution
}

export function DistributionDonut({ data }: DistributionDonutProps) {
	const accuracy = data.totalEvaluatedBets === 0 ? 0 : Math.round(((data.exact.count + data.correct.count) / data.totalEvaluatedBets) * 100)
	const items = [
		{ label: 'Placar exato', value: data.exact.pct, count: data.exact.count, color: 'rgb(var(--green))' },
		{ label: 'Resultado certo', value: data.correct.pct, count: data.correct.count, color: 'rgb(var(--gold))' },
		{ label: 'Errou', value: data.wrong.pct, count: data.wrong.count, color: 'rgb(var(--red))' },
	]

	return (
		<Card className="animate-fade-up p-3">
			<div className="mb-3 text-[11px] font-bold uppercase tracking-wider text-sub">Distribuição total do grupo</div>
			<div className="flex items-center gap-4">
				<Donut percent={accuracy} />
				<div className="flex flex-1 flex-col gap-2">
					{items.map((i) => (
						<div key={i.label}>
							<div className="flex items-center justify-between text-[11px]">
								<span className="flex items-center gap-1 text-sub">
									<span className="h-2 w-2 rounded-full" style={{ background: i.color }} />
									{i.label}
								</span>
								<span className="font-bold" style={{ color: i.color }}>
									{i.value}%
								</span>
							</div>
							<Progress value={i.value} className="mt-1" />
						</div>
					))}
				</div>
			</div>
		</Card>
	)
}

function Donut({ percent }: { percent: number }) {
	const c = 2 * Math.PI * 15.9
	return (
		<svg width={96} height={96} viewBox="0 0 36 36" className="shrink-0">
			<circle cx="18" cy="18" r="15.9" fill="none" stroke="rgb(var(--border))" strokeWidth="3" />
			<circle
				cx="18"
				cy="18"
				r="15.9"
				fill="none"
				stroke="rgb(var(--acc))"
				strokeWidth="3"
				strokeDasharray={`${(c * percent) / 100} ${c}`}
				strokeLinecap="round"
				transform="rotate(-90 18 18)"
			/>
			<text x="18" y="19" textAnchor="middle" fontSize="7" fontWeight="700" fill="rgb(var(--text))" fontFamily="Bebas Neue">
				{percent}%
			</text>
			<text x="18" y="24.5" textAnchor="middle" fontSize="3" fill="rgb(var(--sub))" fontFamily="Outfit">
				acerto
			</text>
		</svg>
	)
}
