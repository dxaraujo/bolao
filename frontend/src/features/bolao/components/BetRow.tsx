import type { GroupedBetItem } from '@bolao/shared'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { resultOf, RESULT_LABEL, RESULT_TONE, pointsFor } from '@/lib/scoring'
import { cn } from '@/lib/cn'
import { useConfig } from '@/hooks/useConfig'

interface BetRowProps {
	bet: GroupedBetItem
	isMe: boolean
}

export function BetRow({ bet, isMe }: BetRowProps) {
	const { data: config } = useConfig()
	const kind = resultOf(bet)
	const tone = RESULT_TONE[kind]
	const points = bet.totalPointsEarned ?? pointsFor(kind, config)

	return (
		<div
			className={cn(
				'grid grid-cols-[1fr_56px_104px_44px] items-center gap-2 px-4 py-2 text-xs',
				isMe && 'bg-acc/[0.06]',
			)}
		>
			<div className="flex items-center gap-2 min-w-0">
				<Avatar className="h-7 w-7 shrink-0">
					<AvatarImage src={`https://${bet.user.picture}`} alt={bet.user.name} />
					<AvatarFallback className="text-[10px]">{bet.user.name.charAt(0)}</AvatarFallback>
				</Avatar>
				<div className="truncate font-semibold">
					{bet.user.name}
					{isMe && <span className="ml-1 rounded bg-acc/15 px-1 py-px text-[9px] font-bold text-acc">Você</span>}
				</div>
			</div>

			<div className="text-center font-display text-base tracking-widest">
				{bet.homeTeamScore != null && bet.awayTeamScore != null ? (
					<span className={cn(tone === 'green' ? 'text-green' : tone === 'gold' ? 'text-gold' : tone === 'acc' ? 'text-acc' : tone === 'purple' ? 'text-purple' : tone === 'red' ? 'text-red' : 'text-sub')}>
						{bet.homeTeamScore}–{bet.awayTeamScore}
					</span>
				) : (
					<span className="text-muted-foreground">—</span>
				)}
			</div>

			<div className="flex justify-center">
				<Badge tone={tone}>{RESULT_LABEL[kind]}</Badge>
			</div>

			<div className={cn('text-center font-display text-base', points > 0 ? 'text-foreground' : 'text-muted-foreground')}>
				{points > 0 ? `+${points}` : 0}
			</div>
		</div>
	)
}
