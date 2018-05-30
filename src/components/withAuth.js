import React, { Component } from 'react';
import AuthService from './authService'

const withAuth = (Comp) => {
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
					this.props.history.replace('/login')
				}
			}
		}
		render() {
			return (
				<Comp {...this.authService}
					history={this.props.history}
					location={this.props.location}
					match={this.props.match}
				/>
			)
		}
	}
}

export default withAuth