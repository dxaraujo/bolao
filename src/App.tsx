import { BrowserRouter, Route, Switch, Redirect } from 'react-router-dom'
import { useClearCache } from 'react-clear-cache';

import FullLayout from './app/layout/fullLayout'
import Login from './features/login/login'

// Font Awsome
import '@fortawesome/fontawesome-free/css/all.min.css'

// BootStrap
import 'bootstrap/dist/css/bootstrap.min.css';

// Flag Icons
import 'flag-icon-css/css/flag-icons.min.css'

// Core UI
import '@coreui/coreui/dist/css/bootstrap.min.css'
import '@coreui/coreui/dist/css/coreui.min.css'

// Application Styles
import 'sweetalert2/dist/sweetalert2.min.css'
import 'react-toastify/dist/ReactToastify.min.css'
import './App.css'

const app = () => {
	const { isLatestVersion, emptyCacheStorage } = useClearCache();
	return isLatestVersion ? (
		<BrowserRouter>
			<Switch>
				<Route path='/login' component={Login} />
				<Route path='/' component={FullLayout} />
				<Redirect from="*" to="/" />
			</Switch>
		</BrowserRouter>
	) : (
		<p>
			<a href="#" onClick={e => { e.preventDefault(); emptyCacheStorage(); }}>Update version</a>
        </p>
	)
}

export default app