import React from "react";
import { useHistory, useLocation } from "react-router-dom";
import { loggedIn, logout, loginWithGoogle } from './authService'

export const withAuth = (Component: React.ComponentType) => (props: any) => {
	let authenticated = false
	const history = useHistory()
	const location = useLocation()
	const pathname = location.pathname
	const token: string | null = new URLSearchParams(location.search).get('token');
	if (pathname !== '/login') {
		if (!loggedIn() && !token) {
			logout(() => history.replace('/login'))
		} else if (!loggedIn()) {
			loginWithGoogle(token!, () => history.replace('/'))
		} else {
			authenticated = true
		}
	} else {
		authenticated = true
	}
	return authenticated ? <Component/> : <div>Aguarde...</div>
}

export default withAuth