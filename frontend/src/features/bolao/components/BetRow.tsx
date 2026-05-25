import type { GroupedBetParticipant } from '@bolao/shared'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { resultKindOf, RESULT_ICON, RESULT_LABEL, RESULT_TONE } from '@/lib/scoring'
import { resolveAssetUrl } from '@/lib/assets'
import { cn } from '@/lib/cn'

interface BetRowProps {
	participant: GroupedBetParticipant
	isMe: boolean
}

export function BetRow({ participant, isMe }: BetRowProps) {
	const kind = resultKindOf(participant.result)
	const tone = RESULT_TONE[kind]
	const Icon = RESULT_ICON[kind]
	const points = participant.result?.points ?? 0
	const score = participant.score

	return (
		<div
			className={cn(
				'grid grid-cols-[1fr_56px_104px_44px] items-center gap-2 px-4 py-2 text-sm',
				isMe && 'bg-acc/[0.06]',
			)}
		>
			<div className="flex items-center gap-2 min-w-0">
				<Avatar className="h-9 w-9 shrink-0">
					<AvatarImage src={participant.user.avatar ? resolveAssetUrl(participant.user.avatar) : undefined} alt={participant.user.name} />
					<AvatarFallback className="text-xs">{participant.user.name.charAt(0)}</AvatarFallback>
				</Avatar>
				<div className="truncate font-semibold">
					{participant.user.name}
					{isMe && <span className="ml-1 rounded bg-acc/15 px-1 py-px text-[11px] font-bold text-acc">Você</span>}
				</div>
			</div>

			<div className="text-center font-display text-base tracking-widest">
				{score ? (
					<span
						className={cn(
							tone === 'green' ? 'text-green' : tone === 'gold' ? 'text-gold' : tone === 'acc' ? 'text-acc' : tone === 'purple' ? 'text-purple' : tone === 'red' ? 'text-red' : 'text-sub',
						)}
					>
						{score.home}–{score.away}
					</span>
				) : (
					<span className="text-muted-foreground">—</span>
				)}
			</div>

			<div className="flex justify-center">
				<Badge tone={tone}>
					{score ? (
						<>
							<Icon className="h-3 w-3" aria-hidden />
							{RESULT_LABEL[kind]}
						</>
					) : (
						'—'
					)}
				</Badge>
			</div>

			<div className={cn('text-center font-display text-base', points > 0 ? 'text-foreground' : 'text-muted-foreground')}>
				{points > 0 ? `+${points}` : 0}
			</div>
		</div>
	)
}
