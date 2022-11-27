import React from "react";
import { useHistory, useLocation } from "react-router-dom";
import { loggedIn, logout } from './authService'

export const withAuth = (Component: React.ComponentType) => (props: any) => {
	let authenticated = false
	const history = useHistory()
	const location = useLocation()
	const pathname = location.pathname
	if (pathname !== '/login') {
		if (!loggedIn()) {
			logout(() => history.replace('/login'))	
		} else {
			authenticated = true
		}
	} else {
		authenticated = true
	}
	return authenticated ? <Component/> : <div>Aguarde...</div>
}

export default withAuth