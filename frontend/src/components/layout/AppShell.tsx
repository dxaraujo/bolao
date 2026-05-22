import { type PropsWithChildren } from 'react'

export function AppShell({ children }: PropsWithChildren) {
	return (
		<div className="flex min-h-screen w-full bg-background font-sans md:justify-center">
			<div className="relative flex w-full flex-col bg-background md:max-w-screen-2xl md:flex-row">
				{children}
			</div>
		</div>
	)
}
