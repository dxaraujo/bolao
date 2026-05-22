import type { RankingItem } from '@bolao/shared'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card } from '@/components/ui/card'

interface PodiumProps {
	leaders: RankingItem[]
}

const PODIUM_ORDER = [1, 0, 2]
const HEIGHTS = ['h-14', 'h-20', 'h-12']
const MEDALS = ['🥈', '🥇', '🥉']
const TONES = ['text-sub', 'text-gold', 'text-acc']

export function Podium({ leaders }: PodiumProps) {
	return (
		<Card className="animate-fade-up overflow-hidden bg-gradient-to-br from-acc/10 to-gold/5">
			<div className="px-4 pt-4 pb-2 text-[11px] font-bold uppercase tracking-wider text-sub">Pódio</div>
			<div className="flex items-end justify-center gap-2 px-4 pb-2">
				{PODIUM_ORDER.map((idx, slot) => {
					const user = leaders[idx]
					if (!user) return <div key={slot} className="flex-1" />
					return (
						<div key={user._id} className="flex flex-1 flex-col items-center">
							<div className="text-sm">{MEDALS[slot]}</div>
							<Avatar className="my-1 h-9 w-9">
								<AvatarImage src={user.picture} alt={user.name} />
								<AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
							</Avatar>
							<div className="text-[10px] font-bold">{user.name}</div>
							<div className={`font-display text-base ${TONES[slot]}`}>{user.totalPointsEarned}pts</div>
							<div className={`mt-1 w-full ${HEIGHTS[slot]} rounded-t bg-gradient-to-t from-transparent to-current opacity-30 ${TONES[slot]}`} />
						</div>
					)
				})}
			</div>
		</Card>
	)
}
