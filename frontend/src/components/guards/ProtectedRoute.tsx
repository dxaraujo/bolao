import { type PropsWithChildren } from 'react'
import { Navigate } from 'react-router-dom'

import { useMe } from '@/hooks/useMe'
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
	const { data: me } = useMe()
	if (!me?.isAdmin) return <Navigate to="/" replace />
	return <>{children}</>
}

export function ActiveRoute({ children }: PropsWithChildren) {
	const { data: me, isLoading } = useMe()
	const isActive = me?.isActive
	if (isLoading) {
		return null
	}
	if (!isActive) {
		return <Navigate to="/" replace />
	}
	return <>{children}</>
}
