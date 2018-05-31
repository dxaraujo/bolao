import decode from 'jwt-decode';
import backendURI from '../config'

export default class AuthService {

	constructor() {
		this.url = backendURI
		this.fetch = this.fetch.bind(this)
		this.login = this.login.bind(this)
		this.loginWithFacebook = this.loginWithFacebook.bind(this)
		this.logout = this.logout.bind(this)
		this.loggedIn = this.loggedIn.bind(this)
		this.getAuthenticatedUser = this.getAuthenticatedUser.bind(this)
	}

	login(username, password) {
		return this.fetch('login', {
			method: 'POST',
			body: JSON.stringify({ username, password })
		}).then(res => {
			this.setToken(res.token)
			const user =  decode(res.token);
			this.setAuthenticatedUser(user)
			return Promise.resolve(res);
		})
	}

	loginWithFacebook(content, callback) {
		console.log(content)
		const user = {facebookId: content.id, name: content.name, username: content.email, avatar: content.picture.data.url }
		console.log(user)
		this.setFacebookToken(content.accessToken)
		this.setAuthenticatedUser(user)
		this.registerFacebookUser(user, callback)

	}

	registerFacebookUser(user, callback) {
		return this.fetch('registerfacebookuser', {
			method: 'POST',
			body: JSON.stringify({ ...user, password: 'facebookMesa5@', confirmPassword: 'facebookMesa5@'})
		}).then(res => {
			this.setToken(res.token)
			const user =  decode(res.token)
			console.log(user)
			this.setAuthenticatedUser(user)
			callback()
		})
	}

	loggedIn() {
		const token = this.getToken()
		const facebookToken = this.getFacebookToken()
		return facebookToken ? !!facebookToken : !!token && !this.isTokenExpired(token)
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

	setFacebookToken(content) {
		localStorage.setItem('facebook_token', content)
	}

	getFacebookToken() {
		return localStorage.getItem('facebook_token')
	}

	logout(callback) {
		localStorage.removeItem('jwt_token');
		localStorage.removeItem('facebook_token');
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
		localStorage.setItem('user_content', JSON.stringify(content))
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