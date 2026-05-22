import { Moon, Sun } from 'lucide-react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { useTheme } from '@/providers/ThemeProvider'
import { useMe } from '@/hooks/useMe'

export function Header() {
	const { isDark, toggle } = useTheme()
	const { data: me } = useMe()

	const initial = me?.name?.charAt(0)?.toUpperCase() ?? '?'

	return (
		<header className="sticky top-0 z-50 border-b border-border bg-gradient-to-b from-surface to-background px-4 py-3">
			<div className="flex items-center justify-between">
				<div className="font-display text-2xl leading-none tracking-wider">
					COPA<span className="text-acc">BET</span>
					<span className="ml-2 text-xs font-medium text-sub">2026</span>
				</div>
				<div className="flex items-center gap-2">
					<Button size="icon" variant="outline" onClick={toggle} aria-label="Alternar tema">
						{isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
					</Button>
					<Avatar className="h-8 w-8">
						<AvatarImage src={me?.picture} alt={me?.name} />
						<AvatarFallback className="text-xs">{initial}</AvatarFallback>
					</Avatar>
				</div>
			</div>
		</header>
	)
}
