import React, { Component } from 'react';
import AuthService from './authService'

const withAuth = (Comp, url) => {
	const authService = new AuthService(url);
	return class Authenticated extends Component {
		constructor(props) {
			super(props)
			this.authService = authService
			this.state = { user: null }
		}
		componentWillReceiveProps() {
			this.checkIfAuthenticated()
		}
		componentWillMount() {
			this.checkIfAuthenticated()
		}
		checkIfAuthenticated() {
			if (!this.authService.loggedIn()) {
				this.setState({ user: null })
				this.props.history.replace('/login')
			} else {
				try {
					const profile = this.authService.getAuthenticatedUser()
					this.setState({ user: profile })
				}
				catch (err) {
					this.authService.logout()
					this.props.history.replace('/login')
				}
			}
		}
		render() {
			return this.state.user ? (
				<Comp history={this.props.history}
					location={this.props.location}
					match={this.props.match}
					user={this.state.user}
					login={this.authService.login}
					fetch={this.authService.fetch}
					logout={this.authService.logout}
				/>
			) : (null)
		}
	}
}

export default withAuth