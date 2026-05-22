import { createContext, useCallback, useContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { jwtDecode } from 'jwt-decode'

import { api, getToken, setToken } from '@/lib/api'

interface JwtPayload {
	sub: string
	name: string
	email: string
	picture: string
	isAdmin: boolean
	isActive: boolean
	_id: string
	exp: number
}

interface AuthContextValue {
	authenticated: boolean
	user: JwtPayload | null
	loginWithGoogle: (credential: string) => Promise<void>
	logout: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

function parseToken(token: string | null): JwtPayload | null {
	if (!token) return null
	try {
		const payload = jwtDecode<JwtPayload>(token)
		if (payload.exp * 1000 < Date.now()) return null
		return payload
	} catch {
		return null
	}
}

export function AuthProvider({ children }: PropsWithChildren) {
	const [user, setUser] = useState<JwtPayload | null>(() => parseToken(getToken()))

	useEffect(() => {
		const onUnauthorized = () => setUser(null)
		window.addEventListener('copabet:unauthorized', onUnauthorized)
		return () => window.removeEventListener('copabet:unauthorized', onUnauthorized)
	}, [])

	const loginWithGoogle = useCallback(async (credential: string) => {
		const { token } = await api.post<{ token: string }>('/auth/google', { credential })
		setToken(token)
		setUser(parseToken(token))
	}, [])

	const logout = useCallback(() => {
		setToken(null)
		setUser(null)
	}, [])

	const value = useMemo<AuthContextValue>(
		() => ({ authenticated: !!user, user, loginWithGoogle, logout }),
		[user, loginWithGoogle, logout],
	)

	const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID

	return (
		<GoogleOAuthProvider clientId={clientId ?? ''}>
			<AuthContext.Provider value={value}>{children}</AuthContext.Provider>
		</GoogleOAuthProvider>
	)
}

export function useAuth() {
	const ctx = useContext(AuthContext)
	if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
	return ctx
}
