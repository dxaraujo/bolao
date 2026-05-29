import type { MyBetItem } from '@bolao/shared'

import { Card } from '@/components/ui/card'
import { TeamCrest } from '@/components/shared/TeamCrest'
import { STAGE_LABELS } from '@/lib/stage'
import { formatMatchDate } from '@/lib/format'
import { teamShortName } from '@/lib/team-names'

interface UpcomingMatchCardProps {
	item: MyBetItem
}

export function UpcomingMatchCard({ item }: UpcomingMatchCardProps) {
	const { match, bet } = item
	const stageLabel = STAGE_LABELS[match.stage]?.short ?? match.stage

	return (
		<Card className="animate-fade-up overflow-hidden">
			<div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 px-3 py-3">
				<div className="flex min-w-0 items-center gap-2">
					<TeamCrest team={match.homeTeam} size={28} />
					<span className="min-w-0 truncate text-sm font-bold">{teamShortName(match.homeTeam)}</span>
				</div>

				<div className="flex shrink-0 flex-col items-center gap-0.5 px-2 text-center">
					<span className="text-[10px] font-bold uppercase tracking-wider text-acc">{stageLabel}</span>
					<span className="font-display text-xs font-bold tracking-widest text-sub">{formatMatchDate(match.utcDate)}</span>
					{bet && (
						<span className="mt-0.5 rounded bg-acc/10 px-1.5 py-0.5 font-display text-xs font-bold text-acc">
							{bet.score.home} × {bet.score.away}
						</span>
					)}
				</div>

				<div className="flex min-w-0 items-center justify-end gap-2">
					<span className="min-w-0 truncate text-right text-sm font-bold">{teamShortName(match.awayTeam)}</span>
					<TeamCrest team={match.awayTeam} size={28} />
				</div>
			</div>
		</Card>
	)
}
