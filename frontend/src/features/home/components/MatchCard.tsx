import { MatchStatus, type MyBetItem } from '@bolao/shared'

import { Card } from '@/components/ui/card'
import { LiveDot } from '@/components/shared/LiveDot'
import { TeamCrest } from '@/components/shared/TeamCrest'
import { STAGE_LABELS } from '@/lib/stage'
import { formatMatchDate } from '@/lib/format'
import { teamShortName } from '@/lib/team-names'
import { cn } from '@/lib/cn'

interface MatchCardProps {
	item: MyBetItem
}

export function MatchCard({ item }: MatchCardProps) {
	const { match, bet } = item
	const isLive = match.status === MatchStatus.LIVE
	const hasScore = match.status === MatchStatus.FINISHED || isLive
	const stageLabel = STAGE_LABELS[match.stage]?.short ?? match.stage

	return (
		<Card className={cn('animate-fade-up relative overflow-hidden', isLive && 'border-red/40')}>
			{isLive && <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-red to-transparent" />}
			<div className="flex items-center justify-between px-4 pt-3">
				<span className="text-xs font-bold uppercase tracking-wide text-sub">{stageLabel}</span>
				<div className="flex items-center gap-1.5">
					{isLive && <LiveDot />}
					<span className={cn('text-xs font-bold', isLive ? 'text-red' : match.status === MatchStatus.FINISHED ? 'text-sub' : 'text-acc')}>
						{isLive ? 'AO VIVO' : match.status === MatchStatus.FINISHED ? 'Encerrado' : formatMatchDate(match.utcDate)}
					</span>
				</div>
			</div>

			<div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 px-4 py-3">
				<div className="flex min-w-0 flex-col items-center gap-1 text-center">
					<TeamCrest team={match.homeTeam} size={40} />
					<span className="w-full truncate text-sm font-bold">{teamShortName(match.homeTeam)}</span>
				</div>
				<div className="min-w-[56px] shrink-0 text-center">
					{hasScore ? (
						<div className="font-display text-3xl tracking-widest">
							{match.score?.home ?? 0} – {match.score?.away ?? 0}
						</div>
					) : (
						<div className="text-xs font-bold tracking-widest text-muted-foreground">VS</div>
					)}
				</div>
				<div className="flex min-w-0 flex-col items-center gap-1 text-center">
					<TeamCrest team={match.awayTeam} size={40} />
					<span className="w-full truncate text-sm font-bold">{teamShortName(match.awayTeam)}</span>
				</div>
			</div>

			{bet && (
				<div className="flex items-center justify-center border-t border-border/60 px-4 py-2 text-xs text-sub">
					Seu palpite:&nbsp;
					<span className="font-bold text-foreground">
						{bet.score.home} × {bet.score.away}
					</span>
				</div>
			)}
		</Card>
	)
}
