import decode from 'jwt-decode';
import { backendURI } from '../config/config'

export const loginWithGoogle = (token: string, callback: () => void) => {
	setGoogleToken(token)
	registerGoogleUser(token, callback)
}

const registerGoogleUser = (token: string, callback: () => void) => {
	return authFetch(`registerGoogleUser?token=${token}`, {
		method: 'POST',
	}).then((data: any) => {
		setToken(data.token)
		if (callback) {
			callback()
		}
	})
}

export const loggedIn = () => {
	const token = getToken()
	return !!token && !isTokenExpired(token)
}

const isTokenExpired = (token: string) => {
	try {
		const decoded = decode<any>(token);
		return (decoded.exp < Date.now() / 1000) ? true : false
	} catch (err) {
		return true;
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

const getGoogleToken = () => {
	return localStorage.getItem('google_token')
}

export const logout = (callback?: () => void) => {
	localStorage.removeItem('jwt_token');
	localStorage.removeItem('google_token');
	callback && callback()
}

const authFetch = (url: string, options: {}): Promise<any> => {
	const headers: {[key: string]: string} = { 'Accept': 'application/json', 'Content-Type': 'application/json' }
	if (loggedIn()) {
		headers['Authorization'] = 'Bearer ' + getToken()
	}
	return fetch(`${backendURI}/${url}`, { headers, ...options }).then((response: Response) => {
		if (response.status >= 200 && response.status < 300) {
			return response
		} else {
			var error = new Error(response.statusText)
			throw error
		}
	}).then((response:Response) => response.json())
}