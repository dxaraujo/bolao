import type { LucideIcon } from 'lucide-react'

interface EmptyStateProps {
	icon: LucideIcon
	title: string
	description?: string
}

export function EmptyState({ icon: Icon, title, description }: EmptyStateProps) {
	return (
		<div className="flex flex-col items-center justify-center gap-2 px-6 py-12 text-center">
			<Icon className="h-8 w-8 text-sub" />
			<p className="text-sm font-semibold">{title}</p>
			{description && <p className="text-xs text-sub">{description}</p>}
		</div>
	)
}
