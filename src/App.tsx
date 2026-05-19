import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import FullLayout from './app/layout/fullLayout'
import Login from './features/login/login'

// Font Awsome
import '@fortawesome/fontawesome-free/css/all.min.css'

// BootStrap
import 'bootstrap/dist/css/bootstrap.min.css'

// Flag Icons
import 'flag-icon-css/css/flag-icons.min.css'

// Core UI
import '@coreui/coreui/dist/css/bootstrap.min.css'
import '@coreui/coreui/dist/css/coreui.min.css'

// Application Styles
import 'sweetalert2/dist/sweetalert2.min.css'
import 'react-toastify/dist/ReactToastify.min.css'
import './App.css'

const App = () => (
	<BrowserRouter>
		<Routes>
			<Route path='/login' element={<Login />} />
			<Route path='/*' element={<FullLayout />} />
			<Route path='*' element={<Navigate to='/' replace />} />
		</Routes>
	</BrowserRouter>
)

export default App
