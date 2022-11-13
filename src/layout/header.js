import React, { Component } from 'react'

import { Nav, NavItem, NavLink } from 'reactstrap'
import { AppNavbarBrand, AppSidebarToggler } from '@coreui/react'

import logo from '../assets/img/brand/logo_fifa.webp'
import logoShort from '../assets/img/brand/logo_fifa_image.webp'

class Header extends Component {
	render() {
		return (
			<React.Fragment>
				<AppSidebarToggler className='d-lg-none' display='md' mobile />
				<AppNavbarBrand
					full={{ src: logo, width: 145, height: 45, alt: 'CoreUI Logo' }}
					minimized={{ src: logoShort, width: 40, height: 45, alt: 'CoreUI Logo' }}
				/>
				<AppSidebarToggler className='d-md-down-none' display='lg' />
				<Nav className='d-md-down-none' navbar>
					<NavItem className='px-3'>
						<NavLink href='/'>Dashboard</NavLink>
					</NavItem>
				</Nav>
				<Nav className='ml-auto' navbar>
					<NavItem className='px-3'>
						<NavLink href='' onClick={() => this.props.logout(() => { this.props.history.push('/login') })}>Sair</NavLink>
					</NavItem>
				</Nav>
			</React.Fragment>
		)
	}
}

export default Header