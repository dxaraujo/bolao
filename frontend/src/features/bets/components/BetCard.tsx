import { MatchStatus, type BetListItem } from '@bolao/shared'

import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { TeamCrest } from '@/components/shared/TeamCrest'
import { formatMatchDate } from '@/lib/format'
import { cn } from '@/lib/cn'

export type BetDraft = { homeTeamScore: string; awayTeamScore: string }

interface BetCardProps {
	bet: BetListItem
	draft: BetDraft
	disabled: boolean
	onChange: (draft: BetDraft) => void
}

const FINISHED_STATUSES: MatchStatus[] = [MatchStatus.FINISHED, MatchStatus.LIVE, MatchStatus.IN_PLAY, MatchStatus.PAUSED]

export function BetCard({ bet, draft, disabled, onChange }: BetCardProps) {
	const hasMatchScore = FINISHED_STATUSES.includes(bet.status) && bet.matchHomeTeamScore != null
	const filled = draft.homeTeamScore !== '' && draft.awayTeamScore !== ''

	return (
		<Card className={cn('relative animate-fade-up overflow-hidden', filled && !disabled && 'border-acc/40')}>
			{filled && !disabled && <div className="absolute left-0 top-0 h-full w-0.5 bg-acc" />}

			<div className="flex items-center justify-between px-4 pt-3">
				<span className="text-xs font-semibold text-sub">{formatMatchDate(bet.utcDate)}</span>
				{hasMatchScore && (
					<span className="font-display text-xs tracking-widest text-sub">
						{bet.matchHomeTeamScore} – {bet.matchAwayTeamScore}
					</span>
				)}
			</div>

			<div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 px-4 py-3">
				<div className="flex flex-col items-center gap-1 text-center">
					<TeamCrest src={bet.homeTeam.crest} alt={bet.homeTeam.tla} size={40} />
					<span className="text-sm font-bold">{bet.homeTeam.shortName ?? bet.homeTeam.name}</span>
				</div>

				<div className="flex flex-col items-center gap-1">
					<div className="flex items-center gap-1">
						<Input
							disabled={disabled}
							value={draft.homeTeamScore}
							onChange={(e) => onChange({ ...draft, homeTeamScore: sanitize(e.target.value) })}
							type="number"
							min={0}
							max={20}
							inputMode="numeric"
							className="h-10 w-10 text-center font-display text-xl"
						/>
						<span className="font-bold text-sub">×</span>
						<Input
							disabled={disabled}
							value={draft.awayTeamScore}
							onChange={(e) => onChange({ ...draft, awayTeamScore: sanitize(e.target.value) })}
							type="number"
							min={0}
							max={20}
							inputMode="numeric"
							className="h-10 w-10 text-center font-display text-xl"
						/>
					</div>
					<span className="text-[11px] uppercase tracking-wide text-muted-foreground">palpite</span>
				</div>

				<div className="flex flex-col items-center gap-1 text-center">
					<TeamCrest src={bet.awayTeam.crest} alt={bet.awayTeam.tla} size={40} />
					<span className="text-sm font-bold">{bet.awayTeam.shortName ?? bet.awayTeam.name}</span>
				</div>
			</div>

			{disabled && (bet.homeTeamScore != null || bet.awayTeamScore != null) && (
				<div className="border-t border-border px-4 py-2 text-xs text-sub">
					Seu palpite:&nbsp;
					<span className="font-bold text-foreground">
						{bet.homeTeamScore ?? '-'} × {bet.awayTeamScore ?? '-'}
					</span>
				</div>
			)}
		</Card>
	)
}

function sanitize(value: string) {
	if (value === '') return ''
	const n = Number(value)
	if (Number.isNaN(n)) return ''
	return String(Math.max(0, Math.min(20, n)))
}
