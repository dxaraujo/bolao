import React, { Component } from 'react'
import { Switch, Route, Redirect } from 'react-router-dom'

import PartidaList from './partidaList'
import PartidaForm from './partidaForm'

class Partida extends Component {
	render() {
		return (
			<Switch>
				<Route path='/partida/create' name='New' component={PartidaForm} />
				<Route path='/partida/update' name='Edit' component={PartidaForm} />
				<Route path='/partida/list' name='List' component={PartidaList} />
				<Redirect from="/partida" to="/partida/list" />
			</Switch>
		)
	}
}

export default Partida