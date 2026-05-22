import { type PropsWithChildren } from 'react'
import { Navigate } from 'react-router-dom'

import { useAuth } from '@/providers/AuthProvider'

export function ProtectedRoute({ children }: PropsWithChildren) {
	const { authenticated } = useAuth()
	if (!authenticated) return <Navigate to="/login" replace />
	return <>{children}</>
}

export function PublicOnlyRoute({ children }: PropsWithChildren) {
	const { authenticated } = useAuth()
	if (authenticated) return <Navigate to="/" replace />
	return <>{children}</>
}

export function AdminRoute({ children }: PropsWithChildren) {
	const { user } = useAuth()
	if (!user?.isAdmin) return <Navigate to="/" replace />
	return <>{children}</>
}
