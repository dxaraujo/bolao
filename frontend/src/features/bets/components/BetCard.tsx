import { MatchStatus, type MyBetItem } from '@bolao/shared'

import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { TeamCrest } from '@/components/shared/TeamCrest'
import { formatMatchDate } from '@/lib/format'
import { teamShortName } from '@/lib/team-names'
import { cn } from '@/lib/cn'

export type BetDraft = { home: string; away: string }

interface BetCardProps {
	item: MyBetItem
	draft: BetDraft
	disabled: boolean
	onChange: (draft: BetDraft) => void
}

const HAS_SCORE_STATUSES: MatchStatus[] = [MatchStatus.FINISHED, MatchStatus.LIVE]

export function BetCard({ item, draft, disabled, onChange }: BetCardProps) {
	const { match, bet } = item
	const hasMatchScore = HAS_SCORE_STATUSES.includes(match.status) && match.score != null
	const filled = draft.home !== '' && draft.away !== ''

	return (
		<Card className={cn('relative animate-fade-up overflow-hidden', filled && !disabled && 'border-acc/40')}>
			{filled && !disabled && <div className="absolute left-0 top-0 h-full w-0.5 bg-acc" />}

			<div className="flex items-center justify-between px-4 pt-3">
				<span className="text-xs font-semibold text-sub">{formatMatchDate(match.utcDate)}</span>
				{hasMatchScore && (
					<span className="font-display text-xs tracking-widest text-sub">
						{match.score!.home} – {match.score!.away}
					</span>
				)}
			</div>

			<div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 px-4 py-3">
				<div className="flex flex-col items-center gap-1 text-center">
					<TeamCrest team={match.homeTeam} size={40} />
					<span className="text-sm font-bold">{teamShortName(match.homeTeam)}</span>
				</div>

				<div className="flex flex-col items-center gap-1">
					{disabled ? (
						<>
							<div className="flex items-center gap-2 rounded-md border border-acc/40 bg-acc/10 px-3 py-1.5">
								<span className="font-display text-2xl font-bold text-foreground">{bet?.score.home ?? '-'}</span>
								<span className="font-bold text-sub">×</span>
								<span className="font-display text-2xl font-bold text-foreground">{bet?.score.away ?? '-'}</span>
							</div>
							<span className="text-[11px] uppercase tracking-wide text-acc">seu palpite</span>
						</>
					) : (
						<>
							<div className="flex items-center gap-1">
								<Input
									value={draft.home}
									onChange={(e) => onChange({ ...draft, home: sanitize(e.target.value) })}
									type="number"
									min={0}
									max={20}
									inputMode="numeric"
									className="h-10 w-10 text-center font-display text-xl"
								/>
								<span className="font-bold text-sub">×</span>
								<Input
									value={draft.away}
									onChange={(e) => onChange({ ...draft, away: sanitize(e.target.value) })}
									type="number"
									min={0}
									max={20}
									inputMode="numeric"
									className="h-10 w-10 text-center font-display text-xl"
								/>
							</div>
							<span className="text-[11px] uppercase tracking-wide text-muted-foreground">palpite</span>
						</>
					)}
				</div>

				<div className="flex flex-col items-center gap-1 text-center">
					<TeamCrest team={match.awayTeam} size={40} />
					<span className="text-sm font-bold">{teamShortName(match.awayTeam)}</span>
				</div>
			</div>
		</Card>
	)
}

function sanitize(value: string) {
	if (value === '') return ''
	const n = Number(value)
	if (Number.isNaN(n)) return ''
	return String(Math.max(0, Math.min(20, n)))
}
