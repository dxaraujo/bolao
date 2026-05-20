import { jwtDecode } from 'jwt-decode'
import { backendURI } from '../config/config'

interface JwtPayload {
	exp: number
}

export const loginWithGoogle = (token: string, callback: () => void) => {
	setGoogleToken(token)
	registerGoogleUser(token, callback)
}

const registerGoogleUser = (token: string, callback: () => void) =>
	authFetch(`registerGoogleUser?token=${token}`, { method: 'POST' }).then(
		(data: { token: string }) => {
			setToken(data.token)
			if (callback) callback()
		},
	)

export const loggedIn = () => {
	const token = getToken()
	return !!token && !isTokenExpired(token)
}

const isTokenExpired = (token: string) => {
	try {
		const decoded = jwtDecode<JwtPayload>(token)
		return decoded.exp < Date.now() / 1000
	} catch {
		return true
	}
}

const setToken = (token: string) => {
	localStorage.setItem('jwt_token', token)
}

const getToken = () => {
	return localStorage.getItem('jwt_token')
}

const setGoogleToken = (token: string) => {
	localStorage.setItem('google_token', token)
}

export const logout = (callback?: () => void) => {
	localStorage.removeItem('jwt_token')
	localStorage.removeItem('google_token')
	callback && callback()
}

const authFetch = (url: string, options: RequestInit): Promise<any> => {
	const headers: Record<string, string> = {
		Accept: 'application/json',
		'Content-Type': 'application/json',
	}
	if (loggedIn()) {
		headers['Authorization'] = 'Bearer ' + getToken()
	}
	return fetch(`${backendURI}/${url}`, { headers, ...options })
		.then((response) => {
			if (response.status >= 200 && response.status < 300) return response
			throw new Error(response.statusText)
		})
		.then((response) => response.json())
}
