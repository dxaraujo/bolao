import { MatchStatus, type BetListItem, type MatchListItem } from '@bolao/shared'

import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { TeamCrest } from '@/components/shared/TeamCrest'
import { formatMatchDate } from '@/lib/format'
import { cn } from '@/lib/cn'

export type BetDraft = { homeTeamScore: string; awayTeamScore: string }

interface BetCardProps {
	match: MatchListItem
	bet: BetListItem | undefined
	draft: BetDraft
	disabled: boolean
	onChange: (draft: BetDraft) => void
}

export function BetCard({ match, bet, draft, disabled, onChange }: BetCardProps) {
	const finished = match.status === MatchStatus.FINISHED
	const filled = draft.homeTeamScore !== '' && draft.awayTeamScore !== ''

	return (
		<Card className={cn('relative animate-fade-up overflow-hidden', filled && !disabled && 'border-acc/40')}>
			{filled && !disabled && <div className="absolute left-0 top-0 h-full w-0.5 bg-acc" />}

			<div className="flex items-center justify-between px-4 pt-3">
				<span className="text-[10px] font-semibold text-sub">{formatMatchDate(match.utcDate)}</span>
				{finished && match.homeTeamScore != null && (
					<span className="font-display text-xs tracking-widest text-sub">
						{match.homeTeamScore} – {match.awayTeamScore}
					</span>
				)}
			</div>

			<div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 px-4 py-3">
				<div className="flex flex-col items-center gap-1 text-center">
					<TeamCrest src={match.homeTeam.crest} alt={match.homeTeam.tla} size={40} />
					<span className="text-xs font-bold">{match.homeTeam.shortName ?? match.homeTeam.name}</span>
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
					<span className="text-[9px] uppercase tracking-wide text-muted-foreground">palpite</span>
				</div>

				<div className="flex flex-col items-center gap-1 text-center">
					<TeamCrest src={match.awayTeam.crest} alt={match.awayTeam.tla} size={40} />
					<span className="text-xs font-bold">{match.awayTeam.shortName ?? match.awayTeam.name}</span>
				</div>
			</div>

			{bet && disabled && (bet.homeTeamScore != null || bet.awayTeamScore != null) && (
				<div className="border-t border-border px-4 py-2 text-[11px] text-sub">
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
