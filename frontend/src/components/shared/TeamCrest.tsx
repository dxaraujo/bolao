import { useState } from 'react'

import { cn } from '@/lib/cn'

interface TeamCrestProps {
	src?: string
	alt?: string
	size?: number
	className?: string
}

export function TeamCrest({ src, alt, size = 32, className }: TeamCrestProps) {
	const [error, setError] = useState(false)
	const label = (alt ?? '').slice(0, 3) || '?'

	if (error || !src) {
		return (
			<div
				className={cn('grid place-items-center rounded-full bg-muted text-[10px] font-bold uppercase text-sub', className)}
				style={{ width: size, height: size }}
			>
				{label}
			</div>
		)
	}

	return (
		<img
			src={src}
			alt={alt ?? ''}
			width={size}
			height={size}
			loading="lazy"
			onError={() => setError(true)}
			className={cn('inline-block object-contain', className)}
			style={{ width: size, height: size }}
		/>
	)
}
