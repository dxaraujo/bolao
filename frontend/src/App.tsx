import { RouterProvider } from 'react-router-dom'
import { Toaster } from 'sonner'

import { AuthProvider } from '@/providers/AuthProvider'
import { QueryProvider } from '@/providers/QueryProvider'
import { ThemeProvider } from '@/providers/ThemeProvider'
import { router } from '@/router'

export function App() {
	return (
		<ThemeProvider>
			<QueryProvider>
				<AuthProvider>
					<RouterProvider router={router} />
					<Toaster theme="dark" position="top-center" richColors />
				</AuthProvider>
			</QueryProvider>
		</ThemeProvider>
	)
}
