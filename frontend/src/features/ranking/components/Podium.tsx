import type { LeaderboardItem } from '@bolao/shared'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card } from '@/components/ui/card'
import { resolveAssetUrl } from '@/lib/assets'

interface PodiumProps {
	leaders: LeaderboardItem[]
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
			<div className="px-4 pt-4 pb-2 text-xs font-bold uppercase tracking-wider text-sub">Pódio</div>
			<div className="flex items-end justify-center gap-2 px-4 pb-2">
				{PODIUM_ORDER.map((idx, slot) => {
					const row = leaders[idx]
					if (!row) return <div key={slot} className="flex-1" />
					return (
						<div key={slot} className="flex flex-1 flex-col items-center">
							<div className="text-4xl leading-none p-2">{MEDALS[slot]}</div>
							<Avatar className={`my-1 h-16 w-16 ring-2 ring-offset-2 ring-offset-surface ${RING[slot]}`}>
								<AvatarImage src={row.user.avatar ? resolveAssetUrl(row.user.avatar) : undefined} alt={row.user.name} />
								<AvatarFallback>{row.user.name.charAt(0)}</AvatarFallback>
							</Avatar>
							<div className="text-sm font-bold">{row.user.name}</div>
							<div className={`font-display text-lg leading-none ${TONES[slot]}`}>{row.points}pts</div>
							<div className={`mt-1 w-full rounded-t ${HEIGHTS[slot]} ${BARS[slot]}`} />
						</div>
					)
				})}
			</div>
		</Card>
	)
}
