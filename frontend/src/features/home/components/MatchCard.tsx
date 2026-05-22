import { MatchStatus, type MatchListItem } from '@bolao/shared'

import { Card } from '@/components/ui/card'
import { LiveDot } from '@/components/shared/LiveDot'
import { TeamCrest } from '@/components/shared/TeamCrest'
import { STAGE_LABELS } from '@/lib/stage'
import { formatMatchDate } from '@/lib/format'
import { cn } from '@/lib/cn'

interface MatchCardProps {
	match: MatchListItem
}

const FINISHED_STATUSES: MatchStatus[] = [MatchStatus.FINISHED, MatchStatus.LIVE, MatchStatus.IN_PLAY, MatchStatus.PAUSED]
const LIVE_STATUSES: MatchStatus[] = [MatchStatus.LIVE, MatchStatus.IN_PLAY, MatchStatus.PAUSED]

export function MatchCard({ match }: MatchCardProps) {
	const isLive = LIVE_STATUSES.includes(match.status)
	const hasScore = FINISHED_STATUSES.includes(match.status)
	const stageLabel = STAGE_LABELS[match.stage]?.short ?? match.stage

	return (
		<Card className={cn('animate-fade-up relative overflow-hidden', isLive && 'border-red/40')}>
			{isLive && <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-red to-transparent" />}
			<div className="flex items-center justify-between px-4 pt-3">
				<span className="text-[10px] font-bold uppercase tracking-wide text-sub">{stageLabel}</span>
				<div className="flex items-center gap-1.5">
					{isLive && <LiveDot />}
					<span className={cn('text-[10px] font-bold', isLive ? 'text-red' : hasScore ? 'text-sub' : 'text-acc')}>
						{isLive ? 'AO VIVO' : hasScore ? 'Encerrado' : formatMatchDate(match.utcDate)}
					</span>
				</div>
			</div>

			<div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 px-4 py-3">
				<div className="flex flex-col items-center gap-1 text-center">
					<TeamCrest src={match.homeTeam.crest} alt={match.homeTeam.tla} size={40} />
					<span className="text-xs font-bold">{match.homeTeam.shortName ?? match.homeTeam.name}</span>
				</div>
				<div className="min-w-[60px] text-center">
					{hasScore ? (
						<div className="font-display text-3xl tracking-widest">
							{match.homeTeamScore ?? 0} – {match.awayTeamScore ?? 0}
						</div>
					) : (
						<div className="text-xs font-bold tracking-widest text-muted-foreground">VS</div>
					)}
				</div>
				<div className="flex flex-col items-center gap-1 text-center">
					<TeamCrest src={match.awayTeam.crest} alt={match.awayTeam.tla} size={40} />
					<span className="text-xs font-bold">{match.awayTeam.shortName ?? match.awayTeam.name}</span>
				</div>
			</div>
		</Card>
	)
}
