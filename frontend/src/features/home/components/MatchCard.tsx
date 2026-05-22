import { MatchStatus, type BetListItem } from '@bolao/shared'

import { Card } from '@/components/ui/card'
import { LiveDot } from '@/components/shared/LiveDot'
import { TeamCrest } from '@/components/shared/TeamCrest'
import { STAGE_LABELS } from '@/lib/stage'
import { formatMatchDate } from '@/lib/format'
import { cn } from '@/lib/cn'

interface MatchCardProps {
	bet: BetListItem
}

const LIVE_STATUSES: MatchStatus[] = [MatchStatus.LIVE, MatchStatus.IN_PLAY, MatchStatus.PAUSED]
const HAS_SCORE: MatchStatus[] = [MatchStatus.FINISHED, ...LIVE_STATUSES]

export function MatchCard({ bet }: MatchCardProps) {
	const isLive = LIVE_STATUSES.includes(bet.status)
	const hasScore = HAS_SCORE.includes(bet.status)
	const stageLabel = STAGE_LABELS[bet.stage]?.short ?? bet.stage
	const hasUserBet = bet.homeTeamScore != null && bet.awayTeamScore != null

	return (
		<Card className={cn('animate-fade-up relative overflow-hidden', isLive && 'border-red/40')}>
			{isLive && <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-red to-transparent" />}
			<div className="flex items-center justify-between px-4 pt-3">
				<span className="text-xs font-bold uppercase tracking-wide text-sub">{stageLabel}</span>
				<div className="flex items-center gap-1.5">
					{isLive && <LiveDot />}
					<span
						className={cn(
							'text-xs font-bold',
							isLive ? 'text-red' : bet.status === MatchStatus.FINISHED ? 'text-sub' : 'text-acc',
						)}
					>
						{isLive ? 'AO VIVO' : bet.status === MatchStatus.FINISHED ? 'Encerrado' : formatMatchDate(bet.utcDate)}
					</span>
				</div>
			</div>

		<div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 px-4 py-3">
			<div className="flex min-w-0 flex-col items-center gap-1 text-center">
				<TeamCrest src={bet.homeTeam.crest} alt={bet.homeTeam.tla} size={40} />
				<span className="w-full truncate text-sm font-bold">{bet.homeTeam.shortName ?? bet.homeTeam.name}</span>
			</div>
			<div className="min-w-[56px] shrink-0 text-center">
				{hasScore ? (
					<div className="font-display text-3xl tracking-widest">
						{bet.matchHomeTeamScore ?? 0} – {bet.matchAwayTeamScore ?? 0}
					</div>
				) : (
					<div className="text-xs font-bold tracking-widest text-muted-foreground">VS</div>
				)}
			</div>
			<div className="flex min-w-0 flex-col items-center gap-1 text-center">
				<TeamCrest src={bet.awayTeam.crest} alt={bet.awayTeam.tla} size={40} />
				<span className="w-full truncate text-sm font-bold">{bet.awayTeam.shortName ?? bet.awayTeam.name}</span>
			</div>
		</div>

			{hasUserBet && (
				<div className="flex align-center justify-center border-t border-border/60 px-4 py-2 text-xs text-sub">
					Suas aposta:&nbsp;
					<span className="font-bold text-foreground">
						{bet.homeTeamScore} × {bet.awayTeamScore}
					</span>
				</div>
			)}
		</Card>
	)
}
