import type { LeaderboardItem } from '@bolao/shared'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card } from '@/components/ui/card'
import { resolveAssetUrl } from '@/lib/assets'
import { cn } from '@/lib/cn'

interface RankingListProps {
	users: LeaderboardItem[]
	currentUserId?: string
}

const MEDALS = ['🥇', '🥈', '🥉']
const BAR_COLORS = ['bg-gold', 'bg-sub', 'bg-acc']
const TEXT_COLORS = ['text-gold', 'text-foreground', 'text-foreground']

export function RankingList({ users, currentUserId }: RankingListProps) {
	const max = Math.max(1, ...users.map((u) => u.points))
	return (
		<div className="flex flex-col gap-2">
			{users.map((row, i) => {
				const isMe = row.user._id === currentUserId
				const bar = BAR_COLORS[i] ?? 'bg-muted-foreground'
				const ptsColor = TEXT_COLORS[i] ?? 'text-foreground'
				return (
					<Card
						key={row.user._id}
						className={cn(
							'animate-fade-up flex items-center gap-3 px-3 py-2.5',
							isMe && 'border-acc/40 bg-gradient-to-br from-acc/10 to-transparent',
						)}
					>
						<div className={cn('w-7 text-center font-bold', i < 3 ? 'text-2xl' : 'text-sub')}>
							{i < 3 ? MEDALS[i] : `${row.rank}°`}
						</div>
						<Avatar className="h-14 w-14">
							<AvatarImage src={row.user.avatar ? resolveAssetUrl(row.user.avatar) : undefined} alt={row.user.name} />
							<AvatarFallback>{row.user.name.charAt(0)}</AvatarFallback>
						</Avatar>
						<div className="flex-1">
							<div className="flex items-center gap-2 text-sm font-bold">
								<span>{row.user.name}</span>
								{isMe && <span className="rounded bg-acc/15 px-1 py-px text-[11px] text-acc">Você</span>}
							</div>
							<div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
								<div
									className={cn('h-full rounded-full transition-[width] duration-700 ease-out', bar)}
									style={{ width: `${(row.points / max) * 100}%` }}
								/>
							</div>
						</div>
						<div className="text-right">
							<div className={cn('font-display text-xl leading-none', ptsColor)}>{row.points}</div>
							<div className="text-[11px] uppercase tracking-wide text-sub">pts</div>
						</div>
					</Card>
				)
			})}
		</div>
	)
}
