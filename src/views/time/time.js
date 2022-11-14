import React, { Component } from 'react'
import { Switch, Route, Redirect } from 'react-router-dom'

import TimeList from './timeList'
import TimeForm from './timeForm'

class Time extends Component {
	render() {
		return (
			<Switch>
				<Route path='/time/create' name='New' render={props => (
					<TimeForm {...this.props} />
				)} />
				<Route path='/time/update' name='Edit' render={props => (
					<TimeForm {...this.props} />
				)} />
				<Route path='/time/list' name='List' render={props => (
					<TimeList {...this.props} />
				)} />
				<Redirect from="/time" to="/time/list" />
			</Switch>
		)
	}
}

export default Time