import { BarChart3, Goal, Home, Target, Trophy } from 'lucide-react'
import { NavLink } from 'react-router-dom'

import { cn } from '@/lib/cn'

type TabDef = { to: string; icon: typeof Goal; label: string; end?: boolean }

const TABS: TabDef[] = [
	{ to: '/', icon: Goal, label: 'Jogos', end: true },
	{ to: '/ranking', icon: Trophy, label: 'Ranking' },
	{ to: '/apostas', icon: Target, label: 'Apostas' },
	{ to: '/bolao', icon: Home, label: 'Bolão' },
	{ to: '/stats', icon: BarChart3, label: 'Stats' },
]

export function BottomNav() {
	return (
		<nav className="sticky bottom-0 z-50 flex border-t border-border bg-background/95 backdrop-blur">
			{TABS.map(({ to, icon: Icon, label, end }) => (
				<NavLink
					key={to}
					to={to}
					end={end}
					className={({ isActive }) =>
						cn(
							'flex flex-1 flex-col items-center gap-1 py-2 text-[10px] font-medium transition-colors',
							isActive ? 'text-acc' : 'text-sub hover:text-foreground',
						)
					}
				>
					{({ isActive }) => (
						<>
							<Icon className="h-5 w-5" />
							<span className={cn('text-[10px]', isActive && 'font-bold')}>{label}</span>
							{isActive && <span className="h-0.5 w-4 rounded-full bg-acc" />}
						</>
					)}
				</NavLink>
			))}
		</nav>
	)
}
