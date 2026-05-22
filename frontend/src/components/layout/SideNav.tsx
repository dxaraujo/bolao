import { BarChart3, Goal, Settings, Target, Trophy, Users } from 'lucide-react'
import { NavLink } from 'react-router-dom'

import { cn } from '@/lib/cn'
import { useAuth } from '@/providers/AuthProvider'

type TabDef = { to: string; icon: typeof Goal; label: string; end?: boolean }

const TABS: TabDef[] = [
	{ to: '/', icon: Goal, label: 'Jogos', end: true },
	{ to: '/ranking', icon: Trophy, label: 'Ranking' },
	{ to: '/apostas', icon: Target, label: 'Apostas' },
	{ to: '/bolao', icon: Users, label: 'Bolão' },
	{ to: '/stats', icon: BarChart3, label: 'Stats' },
]

const ADMIN_TAB: TabDef = { to: '/admin', icon: Settings, label: 'Admin' }

export function SideNav() {
	const { user } = useAuth()
	const tabs = user?.isAdmin ? [...TABS, ADMIN_TAB] : TABS
	return (
		<aside className="sticky top-0 hidden h-screen w-56 shrink-0 flex-col border-r border-border bg-gradient-to-b from-surface-2 to-background px-3 py-5 md:flex lg:w-64">
			<div className="px-2 pb-6">
				<div className="font-display text-3xl leading-none tracking-wider">
					COPA<span className="text-acc">BET</span>
				</div>
				<div className="mt-1 text-xs font-medium text-sub">2026</div>
			</div>
			<nav className="flex flex-col gap-1">
				{tabs.map(({ to, icon: Icon, label, end }) => (
					<NavLink
						key={to}
						to={to}
						end={end}
						className={({ isActive }) =>
							cn(
								'group flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors',
								isActive
									? 'bg-acc/10 text-acc'
									: 'text-sub hover:bg-surface hover:text-foreground',
							)
						}
					>
						{({ isActive }) => (
							<>
								<Icon className="h-5 w-5 shrink-0" />
								<span className={cn('flex-1', isActive && 'font-bold')}>{label}</span>
								{isActive && <span className="h-1.5 w-1.5 rounded-full bg-acc" />}
							</>
						)}
					</NavLink>
				))}
			</nav>
		</aside>
	)
}
