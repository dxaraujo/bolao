import React, { Component } from 'react'
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom'

import FullLayout from './layout/fullLayout'
import { Login } from './views'

// Font Awsome
import '@fortawesome/fontawesome'
import '@fortawesome/fontawesome-free-brands'
import '@fortawesome/fontawesome-free-regular'
import '@fortawesome/fontawesome-free-solid'

// Flag Icons
import 'flag-icon-css/css/flag-icon.min.css'

// Core UI
import '@coreui/coreui/dist/css/bootstrap.min.css'
import '@coreui/coreui/dist/css/coreui.min.css'

// Application Styles
import 'sweetalert2/dist/sweetalert2.min.css'
import 'react-toastify/dist/ReactToastify.min.css'
import './App.css'

class App extends Component {
	scrollToTop() {
		let prevLocation = {};
		this.props.history.listenBefore(location => {
			const pathChanged = prevLocation.pathname !== location.pathname;
			const hashChanged = prevLocation.hash !== location.hash;
			if (pathChanged || hashChanged) window.scrollTo(0, 0);
			prevLocation = location;
		});
	}
	render() {
		return (
			<Router onUpdate={() => this.scrollToTop()}>
				<Switch>
					<Route path='/login' component={Login} />
					<Route path='/' component={FullLayout} />
					<Redirect from="*" to="/" />
				</Switch>
			</Router>
		)
	}
}


export default App