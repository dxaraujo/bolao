import type { LeaderboardItem } from '@bolao/shared'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card } from '@/components/ui/card'
import { resolveAssetUrl } from '@/lib/assets'
import { cn } from '@/lib/cn'

interface PodiumProps {
	leaders: LeaderboardItem[]
}

type SlotKey = 'gold' | 'silver' | 'bronze'

const SLOT_META: Record<SlotKey, { medal: string; tone: string; ring: string; bar: string; height: string }> = {
	gold: {
		medal: '🥇',
		tone: 'text-gold',
		ring: 'ring-gold',
		bar: 'bg-gradient-to-t from-gold/5 to-gold/30 border-t-2 border-gold',
		height: 'h-20',
	},
	silver: {
		medal: '🥈',
		tone: 'text-silver',
		ring: 'ring-silver',
		bar: 'bg-gradient-to-t from-silver/5 to-silver/30 border-t-2 border-silver',
		height: 'h-14',
	},
	bronze: {
		medal: '🥉',
		tone: 'text-bronze',
		ring: 'ring-bronze',
		bar: 'bg-gradient-to-t from-bronze/5 to-bronze/30 border-t-2 border-bronze',
		height: 'h-11',
	},
}

export function Podium({ leaders }: PodiumProps) {
	const byRank = groupByRank(leaders)
	const gold = byRank.get(1)
	const silver = byRank.get(2)
	const bronze = byRank.get(3)

	const slots: Array<{ key: SlotKey; group: LeaderboardItem[] | undefined }> = [
		{ key: 'silver', group: silver },
		{ key: 'gold', group: gold },
		{ key: 'bronze', group: bronze },
	]

	return (
		<Card className="animate-fade-up overflow-hidden border-acc/20">
			<div className="px-4 pt-4 pb-2 text-xs font-bold uppercase tracking-wider text-sub">Pódio</div>
			<div className="flex items-end justify-center gap-2 px-4 pb-2">
				{slots.map(({ key, group }) => {
					if (!group || group.length === 0) return <div key={key} className="flex-1" />
					const meta = SLOT_META[key]
					const points = group[0]!.points
					return (
						<div key={key} className="flex flex-1 flex-col items-center">
							<div className="text-4xl leading-none p-2">{meta.medal}</div>
							<PodiumAvatars group={group} ring={meta.ring} />
							<PodiumNames group={group} />
							<div className={`mt-1 font-display text-lg leading-none ${meta.tone}`}>{points}pts</div>
							<div className={`mt-1 w-full rounded-t ${meta.height} ${meta.bar}`} />
						</div>
					)
				})}
			</div>
		</Card>
	)
}

function groupByRank(leaders: LeaderboardItem[]): Map<number, LeaderboardItem[]> {
	const byRank = new Map<number, LeaderboardItem[]>()
	for (const row of leaders) {
		const bucket = byRank.get(row.rank)
		if (bucket) bucket.push(row)
		else byRank.set(row.rank, [row])
	}
	return byRank
}

function PodiumAvatars({ group, ring }: { group: LeaderboardItem[]; ring: string }) {
	if (group.length === 1) {
		const row = group[0]!
		return (
			<Avatar className={`my-1 h-16 w-16 ring-2 ring-offset-2 ring-offset-surface ${ring}`}>
				<AvatarImage src={row.user.avatar ? resolveAssetUrl(row.user.avatar) : undefined} alt={row.user.name} />
				<AvatarFallback>{row.user.name.charAt(0)}</AvatarFallback>
			</Avatar>
		)
	}
	const visible = group.slice(0, 3)
	const overflow = group.length - visible.length
	return (
		<div className="my-1 flex items-center">
			{visible.map((row, i) => (
				<Avatar key={row.user._id} className={cn(`h-11 w-11 ring-2 ring-offset-2 ring-offset-surface ${ring}`, i > 0 && '-ml-3')}>
					<AvatarImage src={row.user.avatar ? resolveAssetUrl(row.user.avatar) : undefined} alt={row.user.name} />
					<AvatarFallback className="text-xs">{row.user.name.charAt(0)}</AvatarFallback>
				</Avatar>
			))}
			{overflow > 0 && (
				<div className="-ml-3 flex h-11 w-11 items-center justify-center rounded-full border-2 border-surface bg-muted text-xs font-bold text-sub">
					+{overflow}
				</div>
			)}
		</div>
	)
}

function PodiumNames({ group }: { group: LeaderboardItem[] }) {
	if (group.length === 1) {
		return <div className="text-sm font-bold text-center">{group[0]!.user.givenName}</div>
	}
	if (group.length <= 3) {
		return (
			<div className="flex flex-col items-center gap-0.5">
				{group.map((row) => (
					<div key={row.user._id} className="text-xs font-semibold leading-tight text-center">
						{row.user.givenName}
					</div>
				))}
			</div>
		)
	}
	return <div className="text-xs font-semibold text-center">{group.length} empatados</div>
}
