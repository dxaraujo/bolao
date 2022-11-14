import decode from 'jwt-decode';
import { backendURI } from '../config'

export default class AuthService {

	constructor() {
		this.url = backendURI
		this.fetch = this.fetch.bind(this)
		this.logout = this.logout.bind(this)
		this.loggedIn = this.loggedIn.bind(this)
		this.getAuthenticatedUser = this.getAuthenticatedUser.bind(this)
	}

	loginWithGoogle(token, callback) {
		this.setGoogleToken(token)
		this.registerGoogleUser(token, callback)
	}

	registerGoogleUser(token, callback) {
		return this.fetch(`registerGoogleUser?token=${token}`, {
			method: 'POST',
		}).then(res => {
			this.setToken(res.token)
			const user = decode(res.token)
			this.setAuthenticatedUser(user)
			if (callback) {
				callback()
			}
		})
	}

	loggedIn() {
		const token = this.getToken()
		return !!token && !this.isTokenExpired(token)
	}

	isTokenExpired(token) {
		try {
			const decoded = decode(token);
			return (decoded.exp < Date.now() / 1000) ? true : false
		} catch (err) {
			return true;
		}
	}

	setToken(idToken) {
		localStorage.setItem('jwt_token', idToken)
	}

	getToken() {
		return localStorage.getItem('jwt_token')
	}

	setGoogleToken(content) {
		localStorage.setItem('google_token', content)
	}

	getGoogleToken() {
		return localStorage.getItem('google_token')
	}

	logout(callback) {
		localStorage.removeItem('jwt_token');
		localStorage.removeItem('google_token');
		localStorage.removeItem('user_content');
		callback()
	}

	getAuthenticatedUser() {
		if (localStorage.getItem('user_content')) {
			return JSON.parse(localStorage.getItem('user_content'))
		}
		return undefined
	}

	setAuthenticatedUser(content) {
		const token = JSON.stringify(content)
		localStorage.setItem('user_content', token)
	}

	fetch(url, options) {

		const headers = { 'Accept': 'application/json', 'Content-Type': 'application/json' }
		if (this.loggedIn()) {
			headers['Authorization'] = 'Bearer ' + this.getToken()
		}

		return fetch(`${this.url}/${url}`, { headers, ...options })
			.then(this.checkStatus)
			.then(response => response.json())
	}

	checkStatus(response) {
		if (response.status >= 200 && response.status < 300) {
			return response
		} else {
			var error = new Error(response.statusText)
			error.response = response
			throw error
		}
	}
}