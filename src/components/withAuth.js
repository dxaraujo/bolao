import React, { Component } from 'react';
import AuthService from './authService'

const withAuth = (Comp) => {
	let authenticated = false
	const authService = new AuthService();
	return class Authenticated extends Component {
		constructor(props) {
			super(props)
			this.authService = authService
		}
		componentWillReceiveProps() {
			this.checkIfAuthenticated()
		}
		componentWillMount() {
			this.checkIfAuthenticated()
		}
		checkIfAuthenticated() {
			const pathname = this.props.history.location.pathname
			const token = new URLSearchParams(this.props.location.search).get('token');
			if (pathname !== '/login') {
				if (!this.authService.loggedIn() && !token) {
					this.authService.logout(() => this.props.history.replace('/login'))
				} else if (!this.authService.loggedIn()) {
					this.authService.loginWithGoogle(token, () => this.props.history.replace('/'))
				} else {
					authenticated = true
				}
			} else {
				authenticated = true
			}
		}
		render() {
			return authenticated ? (
				<Comp {...this.authService}
					history={this.props.history}
					location={this.props.location}
					match={this.props.match}
				/>
			) : null
		}
	}
}

export default withAuth