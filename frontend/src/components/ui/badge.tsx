import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/cn'

const badgeVariants = cva('inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-bold uppercase tracking-wide border', {
	variants: {
		tone: {
			acc: 'bg-acc/10 border-acc/40 text-acc',
			green: 'bg-green/10 border-green/40 text-green',
			gold: 'bg-gold/10 border-gold/40 text-gold',
			red: 'bg-red/10 border-red/40 text-red',
			sub: 'bg-muted/40 border-border text-sub',
			purple: 'bg-purple/10 border-purple/40 text-purple',
		},
	},
	defaultVariants: { tone: 'sub' },
})

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, tone, ...props }: BadgeProps) {
	return <span className={cn(badgeVariants({ tone }), className)} {...props} />
}
