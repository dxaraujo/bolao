import type { RankingItem } from '@bolao/shared'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/cn'

interface RankingListProps {
	users: RankingItem[]
	currentUserId?: string
}

const MEDALS = ['🥇', '🥈', '🥉']

export function RankingList({ users, currentUserId }: RankingListProps) {
	const max = Math.max(1, ...users.map((u) => u.totalPointsEarned))
	return (
		<div className="flex flex-col gap-2">
			{users.map((user, i) => {
				const isMe = user._id === currentUserId
				return (
					<Card
						key={user._id}
						className={cn(
							'animate-fade-up flex items-center gap-3 px-3 py-2.5',
							isMe && 'border-acc/40 bg-gradient-to-br from-acc/10 to-transparent',
						)}
					>
						<div className="w-7 text-center font-bold text-sub">{i < 3 ? MEDALS[i] : `${i + 1}°`}</div>
						<Avatar className="h-9 w-9">
							<AvatarImage src={user.picture} alt={user.name} />
							<AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
						</Avatar>
						<div className="flex-1">
							<div className="flex items-center gap-2 text-sm font-bold">
								<span>{user.name}</span>
								{isMe && <span className="rounded bg-acc/15 px-1 py-px text-[9px] text-acc">Você</span>}
							</div>
							<Progress value={(user.totalPointsEarned / max) * 100} className="mt-1.5" />
						</div>
						<div className="text-right">
							<div className="font-display text-xl leading-none">{user.totalPointsEarned}</div>
							<div className="text-[9px] uppercase tracking-wide text-sub">pts</div>
						</div>
					</Card>
				)
			})}
		</div>
	)
}
