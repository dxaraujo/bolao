import * as React from 'react'
import { cn } from '@/lib/cn'

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
	({ className, type, ...props }, ref) => (
		<input
			ref={ref}
			type={type}
			className={cn(
				'h-10 w-full rounded-md border border-border bg-surface-2 px-3 text-sm text-foreground outline-none ring-acc/60 transition-colors placeholder:text-sub focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50',
				className,
			)}
			{...props}
		/>
	),
)
Input.displayName = 'Input'
