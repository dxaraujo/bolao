import type { RankingItem } from '@bolao/shared'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

import { Card } from '@/components/ui/card'
import { getVisibleSlice } from '@/lib/ranking'

interface PointsChartProps {
	users: RankingItem[]
	currentUserId?: string
}

export function PointsChart({ users, currentUserId }: PointsChartProps) {
	const visible = getVisibleSlice(users, currentUserId)

	const data = visible.map((u) => ({
		name: u.name.split(' ')[0],
		pontos: u.totalPointsEarned,
		exatos: u.exactScore,
	}))

	return (
		<Card className="animate-fade-up p-3">
			<div className="mb-3 text-xs font-bold uppercase tracking-wider text-sub">Pontuação e placares exatos</div>
			<ResponsiveContainer width="100%" height={180}>
				<BarChart data={data} barCategoryGap="28%">
					<CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--border))" vertical={false} />
					<XAxis dataKey="name" tick={{ fontSize: 10, fill: 'rgb(var(--sub))' }} axisLine={false} tickLine={false} />
					<YAxis tick={{ fontSize: 10, fill: 'rgb(var(--sub))' }} axisLine={false} tickLine={false} width={28} />
					<Tooltip
						contentStyle={{
							background: 'rgb(var(--surface))',
							border: '1px solid rgb(var(--border))',
							borderRadius: 8,
							fontSize: 12,
						}}
					/>
					<Bar dataKey="pontos" fill="rgb(var(--acc))" radius={[4, 4, 0, 0]} />
					<Bar dataKey="exatos" fill="rgb(var(--gold))" radius={[4, 4, 0, 0]} />
				</BarChart>
			</ResponsiveContainer>
		</Card>
	)
}
