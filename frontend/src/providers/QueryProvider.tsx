import { type PropsWithChildren, useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

export function QueryProvider({ children }: PropsWithChildren) {
	const [client] = useState(
		() =>
			new QueryClient({
				defaultOptions: {
					queries: {
						staleTime: 30_000,
						retry: 1,
						refetchOnWindowFocus: false,
					},
				},
			}),
	)
	return (
		<QueryClientProvider client={client}>
			{children}
			{import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-left" />}
		</QueryClientProvider>
	)
}
