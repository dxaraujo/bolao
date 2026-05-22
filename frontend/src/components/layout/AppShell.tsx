import { type PropsWithChildren } from 'react'

export function AppShell({ children }: PropsWithChildren) {
	return (
		<div className="flex min-h-screen w-full justify-center bg-background font-sans">
			<div className="relative flex w-full max-w-[430px] flex-col bg-background">{children}</div>
		</div>
	)
}
