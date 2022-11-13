import React, { Component } from 'react'
import { Switch, Route, Redirect } from 'react-router-dom'

import PartidaList from './partidaList'
import PartidaForm from './partidaForm'

class Partida extends Component {
	render() {
		return (
			<Switch>
				<Route path='/partida/create' name='New' render={props => (
					<PartidaForm {...this.props} />
				)} />
				<Route path='/partida/update' name='Edit' render={props => (
					<PartidaForm {...this.props} />
				)} />
				<Route path='/partida/list' name='List' render={props => (
					<PartidaList {...this.props} />
				)} />
				<Redirect from="/partida" to="/partida/list" />
			</Switch>
		)
	}
}

export default Partida