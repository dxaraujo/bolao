import type { BetListItem } from '@bolao/shared'

import { Card } from '@/components/ui/card'
import { TeamCrest } from '@/components/shared/TeamCrest'
import { STAGE_LABELS } from '@/lib/stage'
import { formatMatchDate } from '@/lib/format'

interface UpcomingMatchCardProps {
	bet: BetListItem
}

export function UpcomingMatchCard({ bet }: UpcomingMatchCardProps) {
	const stageLabel = STAGE_LABELS[bet.stage]?.short ?? bet.stage
	const hasUserBet = bet.homeTeamScore != null && bet.awayTeamScore != null

	return (
		<Card className="animate-fade-up overflow-hidden">
			<div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 px-3 py-3">
				<div className="flex min-w-0 items-center gap-2">
					<TeamCrest src={bet.homeTeam.crest} alt={bet.homeTeam.tla} size={28} />
					<span className="min-w-0 truncate text-sm font-bold">{bet.homeTeam.shortName ?? bet.homeTeam.name}</span>
				</div>

				<div className="flex shrink-0 flex-col items-center gap-0.5 px-2 text-center">
					<span className="text-[10px] font-bold uppercase tracking-wider text-acc">{stageLabel}</span>
					<span className="font-display text-xs font-bold tracking-widest text-sub">
						{formatMatchDate(bet.utcDate)}
					</span>
					{hasUserBet && (
						<span className="mt-0.5 rounded bg-acc/10 px-1.5 py-0.5 font-display text-xs font-bold text-acc">
							{bet.homeTeamScore} × {bet.awayTeamScore}
						</span>
					)}
				</div>

				<div className="flex min-w-0 items-center justify-end gap-2">
					<span className="min-w-0 truncate text-right text-sm font-bold">{bet.awayTeam.shortName ?? bet.awayTeam.name}</span>
					<TeamCrest src={bet.awayTeam.crest} alt={bet.awayTeam.tla} size={28} />
				</div>
			</div>
		</Card>
	)
}
