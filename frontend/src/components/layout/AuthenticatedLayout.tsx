import { Outlet } from 'react-router-dom'

import { useWatchResults } from '@/hooks/useWatchResults'

import { AppShell } from './AppShell'
import { BottomNav } from './BottomNav'
import { Header } from './Header'
import { SideNav } from './SideNav'

export function AuthenticatedLayout() {
	useWatchResults()
	return (
		<AppShell>
			<SideNav />
			<div className="flex min-h-screen min-w-0 flex-1 flex-col">
				<Header />
				<main className="flex flex-1 flex-col overflow-y-auto overscroll-auto">
					<div className="mx-auto flex w-full max-w-screen-md flex-1 flex-col md:max-w-screen-lg md:px-2 lg:px-4">
						<Outlet />
					</div>
				</main>
				<BottomNav />
			</div>
		</AppShell>
	)
}
