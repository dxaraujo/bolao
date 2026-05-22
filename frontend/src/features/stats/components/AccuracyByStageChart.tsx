import { useMemo } from 'react'
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { RankingItem, StageAccuracy } from '@bolao/shared'

import { Card } from '@/components/ui/card'
import { STAGE_LABELS } from '@/lib/stage'
import { getVisibleSlice } from '@/lib/ranking'

interface AccuracyByStageChartProps {
	data: StageAccuracy[]
	ranking?: RankingItem[]
	currentUserId?: string
}

const COLORS = ['rgb(var(--acc))', 'rgb(var(--gold))', 'rgb(var(--purple))', 'rgb(var(--green))', 'rgb(var(--red))']

export function AccuracyByStageChart({ data, ranking, currentUserId }: AccuracyByStageChartProps) {
	const visibleIds = useMemo(() => {
		if (!ranking || ranking.length === 0) return null
		return new Set(getVisibleSlice(ranking, currentUserId).map((u) => u._id))
	}, [ranking, currentUserId])

	const { rows, users } = useMemo(() => {
		const userMap = new Map<string, string>()
		const rows = data.map((stage) => {
			const point: Record<string, number | string> = {
				fase: STAGE_LABELS[stage.matchStage]?.short ?? stage.matchStage,
			}
			for (const u of stage.users) {
				if (visibleIds && !visibleIds.has(u._id)) continue
				userMap.set(u._id, u.name)
				point[u.name] = u.accuracyPct
			}
			return point
		})
		return { rows, users: Array.from(userMap.values()) }
	}, [data, visibleIds])

	return (
		<Card className="animate-fade-up p-3">
			<div className="mb-3 text-xs font-bold uppercase tracking-wider text-sub">Evolução por fase (%)</div>
			<ResponsiveContainer width="100%" height={180}>
				<LineChart data={rows}>
					<CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--border))" vertical={false} />
					<XAxis dataKey="fase" tick={{ fontSize: 10, fill: 'rgb(var(--sub))' }} axisLine={false} tickLine={false} />
					<YAxis tick={{ fontSize: 10, fill: 'rgb(var(--sub))' }} axisLine={false} tickLine={false} width={28} domain={[0, 100]} />
					<Tooltip
						contentStyle={{
							background: 'rgb(var(--surface))',
							border: '1px solid rgb(var(--border))',
							borderRadius: 8,
							fontSize: 12,
						}}
					/>
					{users.map((name, i) => (
						<Line key={name} type="monotone" dataKey={name} stroke={COLORS[i % COLORS.length]} strokeWidth={2} dot={{ r: 3 }} />
					))}
				</LineChart>
			</ResponsiveContainer>
			<div className="mt-2 flex flex-wrap gap-3 text-xs text-sub">
				{users.map((u, i) => (
					<span key={u} className="flex items-center gap-1">
						<span className="h-1 w-3 rounded-full" style={{ background: COLORS[i % COLORS.length] }} /> {u}
					</span>
				))}
			</div>
		</Card>
	)
}
