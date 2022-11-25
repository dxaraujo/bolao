import { useHistory } from "react-router-dom";
import { Nav, NavItem, NavLink } from 'reactstrap'
import { AppNavbarBrand, AppSidebarToggler } from '@coreui/react'

import { logout } from '../auth/authService'

import logo from '../../assets/img/brand/logo_fifa.webp'
import logoShort from '../../assets/img/brand/logo_fifa_image.webp'

const header = () => {
	const history = useHistory()
	return (
		<>
			<AppSidebarToggler className='d-lg-none' display='md' mobile />
			<AppNavbarBrand
				full={{ src: logo, width: 145, height: 45, alt: 'Bolao Copa 2022' }}
				minimized={{ src: logoShort, width: 40, height: 45, alt: 'Bolao Copa 2022' }}
			/>
			<AppSidebarToggler className='d-md-down-none' display='lg' />
			<Nav className='d-md-down-none' navbar>
				<NavItem className='px-3'>
					<NavLink href='/'>Dashboard</NavLink>
				</NavItem>
			</Nav>
			<Nav className='ml-auto' navbar>
				<NavItem className='px-3'>
					<NavLink href='' onClick={() => logout(() => { history.replace('/login') })}>Sair</NavLink>
				</NavItem>
			</Nav>
		</>
	)
}

export default header