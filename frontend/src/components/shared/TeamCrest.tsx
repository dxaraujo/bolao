import { useState } from 'react'
import type { TeamPayload } from '@bolao/shared'

import { resolveAssetUrl } from '@/lib/assets'
import { cn } from '@/lib/cn'

interface TeamCrestProps {
	team?: Pick<TeamPayload, 'flagEmoji' | 'crest' | 'tla' | 'name' | 'shortName'> | null
	size?: number
	className?: string
}

export function TeamCrest({ team, size = 32, className }: TeamCrestProps) {
	const [error, setError] = useState(false)
	const label = (team?.tla ?? team?.shortName ?? team?.name ?? '?').slice(0, 3)

	if (team?.flagEmoji) {
		return (
			<span
				className={cn('inline-grid place-items-center select-none', className)}
				style={{ width: size, height: size, fontSize: Math.round(size * 0.9), lineHeight: 1 }}
				aria-label={team.name ?? team.tla}
			>
				{team.flagEmoji}
			</span>
		)
	}

	const crest = team?.crest
	if (error || !crest) {
		return (
			<div
				className={cn('grid place-items-center rounded-full bg-muted text-xs font-bold uppercase text-sub', className)}
				style={{ width: size, height: size }}
			>
				{label}
			</div>
		)
	}

	return (
		<img
			src={resolveAssetUrl(crest)}
			alt={team?.name ?? ''}
			width={size}
			height={size}
			loading="lazy"
			onError={() => setError(true)}
			className={cn('inline-block object-contain', className)}
			style={{ width: size, height: size }}
		/>
	)
}
