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
			if (pathname !== '/login' && pathname !== '/signup' && pathname !== '/validateToken') {
				if (!this.authService.loggedIn()) {
					this.props.history.replace('/')
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