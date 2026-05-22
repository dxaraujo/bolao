import { Outlet } from 'react-router-dom'

import { AppShell } from './AppShell'
import { BottomNav } from './BottomNav'
import { Header } from './Header'

export function AuthenticatedLayout() {
	return (
		<AppShell>
			<Header />
			<main className="flex flex-1 flex-col overflow-y-auto">
				<Outlet />
			</main>
			<BottomNav />
		</AppShell>
	)
}
