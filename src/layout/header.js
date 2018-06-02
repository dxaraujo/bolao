import React, { Component } from 'react'

import { Nav, NavItem, NavLink } from 'reactstrap'
import { AppNavbarBrand, AppSidebarToggler } from '@coreui/react'

import logo from '../assets/img/brand/logo.png'
import logoShort from '../assets/img/brand/logoShort.svg'

class Header extends Component {
	render() {
		return (
			<React.Fragment>
				<AppSidebarToggler className='d-lg-none' display='md' mobile />
				<AppNavbarBrand
					full={{ src: logo, width: 145, height: 20, alt: 'CoreUI Logo' }}
					minimized={{ src: logoShort, width: 40, height: 15, alt: 'CoreUI Logo' }}
				/>
				<AppSidebarToggler className='d-md-down-none' display='lg' />
				<Nav className='d-md-down-none' navbar>
					<NavItem className='px-3'>
						<NavLink href='/'>Dashboard</NavLink>
					</NavItem>
				</Nav>
				<Nav className='ml-auto' navbar>
					<NavItem className='px-3'>
						<NavLink href='' onClick={() => this.props.logout(() => { this.props.history.replace('/index.html') })}>Sair</NavLink>
					</NavItem>
				</Nav>
			</React.Fragment>
		)
	}
}

export default Header