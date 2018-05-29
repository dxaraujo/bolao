import React, { Component } from 'react'
import { Switch, Route, Redirect } from 'react-router-dom'

import TimeList from './timeList'
import TimeForm from './timeForm'

class Time extends Component {
	render() {
		return (
			<Switch>
				<Route path='/time/create' name='New' component={TimeForm} />
				<Route path='/time/update' name='Edit' component={TimeForm} />
				<Route path='/time/list' name='List' component={TimeList} />
				<Redirect from="/time" to="/time/list" />
			</Switch>
		)
	}
}

export default Time