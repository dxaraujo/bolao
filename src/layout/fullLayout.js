import React, { Component } from 'react'
import { Redirect, Route, Switch } from 'react-router-dom'
import { Container } from 'reactstrap'
import { AppHeader, AppFooter, AppSidebar, AppSidebarHeader, AppSidebarForm, AppSidebarNav, AppSidebarFooter, AppSidebarMinimizer } from '@coreui/react'
import { ToastContainer } from "react-toastify";

import navigations from '../navigation';
import routes from '../router'

import Header from './header'
import Footer from './footer'
import withAuth from '../components/withAuth'

class FullLayout extends Component {
	render() {
		return (
			<div className='app header-fixed footer-fixed'>
				<ToastContainer />
				<AppHeader fixed>
					<Header {...this.props} />
				</AppHeader>
				<div className='app-body'>
					<AppSidebar fixed display='lg'>
						<AppSidebarHeader />
						<AppSidebarForm />
						<AppSidebarNav navConfig={navigations} />
						<AppSidebarFooter />
						<AppSidebarMinimizer />
					</AppSidebar>
					<main className='main'>
						<Container fluid>
							<Switch>
								{routes.map((route, idx) => {
									return route.component ? (<Route key={idx} path={route.path} exact={route.exact} name={route.name} render={props => (
										<route.component {...this.props} />
									)} />) : (null);
								})}
								<Redirect from="/" to="/dashboard" />
							</Switch>
						</Container>
					</main>
				</div>
				<AppFooter>
					<Footer />
				</AppFooter>
			</div>
		)
	}
}

export default withAuth(FullLayout)