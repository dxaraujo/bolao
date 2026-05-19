import { ComponentType, useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { loggedIn, logout } from './authService'

export const withAuth = (Component: ComponentType) => () => {
	const navigate = useNavigate()
	const location = useLocation()
	const [authenticated, setAuthenticated] = useState(false)

	useEffect(() => {
		const onLogin = location.pathname === '/login'
		if (onLogin) {
			setAuthenticated(true)
			return
		}
		if (loggedIn()) {
			setAuthenticated(true)
		} else {
			logout(() => navigate('/login', { replace: true }))
		}
	}, [location.pathname, navigate])

	return authenticated ? <Component /> : <div>Aguarde...</div>
}

export default withAuth
