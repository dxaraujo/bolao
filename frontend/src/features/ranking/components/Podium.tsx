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
const RING = ['ring-sub/60', 'ring-gold', 'ring-acc']
const BARS = [
	'bg-gradient-to-t from-sub/5 to-sub/30 border-t-2 border-sub/60',
	'bg-gradient-to-t from-gold/5 to-gold/30 border-t-2 border-gold',
	'bg-gradient-to-t from-acc/5 to-acc/30 border-t-2 border-acc',
]

export function Podium({ leaders }: PodiumProps) {
	return (
		<Card className="animate-fade-up overflow-hidden border-acc/20 bg-gradient-to-br from-acc/10 to-gold/10">
			<div className="px-4 pt-4 pb-2 text-[11px] font-bold uppercase tracking-wider text-sub">Pódio</div>
			<div className="flex items-end justify-center gap-2 px-4 pb-2">
				{PODIUM_ORDER.map((idx, slot) => {
					const user = leaders[idx]
					if (!user) return <div key={slot} className="flex-1" />
					return (
						<div key={user._id} className="flex flex-1 flex-col items-center">
							<div className="text-base leading-none">{MEDALS[slot]}</div>
							<Avatar className={`my-1 h-10 w-10 ring-2 ring-offset-2 ring-offset-surface ${RING[slot]}`}>
								<AvatarImage src={user.picture} alt={user.name} />
								<AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
							</Avatar>
							<div className="text-[10px] font-bold">{user.name}</div>
							<div className={`font-display text-lg leading-none ${TONES[slot]}`}>{user.totalPointsEarned}pts</div>
							<div className={`mt-1 w-full rounded-t ${HEIGHTS[slot]} ${BARS[slot]}`} />
						</div>
					)
				})}
			</div>
		</Card>
	)
}
