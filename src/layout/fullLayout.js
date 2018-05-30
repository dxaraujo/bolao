import React, { Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux';
import { Redirect, Route, Switch } from 'react-router-dom'

import { Container, Badge } from 'reactstrap'
import { AppHeader, AppFooter, AppSidebar, AppSidebarHeader, AppSidebarForm, AppSidebarNav, AppSidebarFooter, AppSidebarMinimizer } from '@coreui/react'
import { ToastContainer } from "react-toastify";

import { search as faseSearch } from '../views/fase/faseActions'
import navigations from '../navigation';
import routes from '../router'

import Header from './header'
import Footer from './footer'
import withAuth from '../components/withAuth'

import blackAvatar from '../assets/img/blankavatar.png'

class FullLayout extends Component {
	render() {
		return (
			<div className='app'>
				<ToastContainer />
				<AppHeader fixed>
					<Header {...this.props} />
				</AppHeader>
				<div className='app-body'>
					<AppSidebar fixed display='lg'>
						<AppSidebarHeader>
							<div style={{ backgroundColor: '#494F54', padding: '20px' }}>
								<div style={{ maxHeight: '70px', textAlign: 'left' }}>
									<img alt='avatar' className='img-avatar' src={this.props.user.avatar ? this.props.user.avatar : blackAvatar} width='50px' height='50px' />
								</div>
								<div style={{ maxHeight: '20px', minHeight: '20px', textAlign: 'left', marginTop: '5px', marginBottom: '10px' }}>
									<span>{this.props.user.name}</span>
								</div>
								<div style={{ maxHeight: '15px', minHeight: '15px', textAlign: 'left', marginBottom: '10px' }}>
									<Badge color="success" style={{ marginRight: '10px' }}>
										<a href='/dashboard' className='badgeLink'>
											Trocar Senha
										</a>
									</Badge>
									<Badge color="primary" style={{ color: 'white !important' }}>
										<a href='/dashboard' className='badgeLink'>
											Trocar Avatar
										</a>
									</Badge>
								</div>
							</div>
						</AppSidebarHeader>
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
				<AppFooter fixed>
					<Footer />
				</AppFooter>
			</div>
		)
	}
}

const mapStateToProps = state => ({ user: state.userStore.loggedUser })
const mapDispatchToProps = dispatch => bindActionCreators({ faseSearch }, dispatch)

export default connect(mapStateToProps, mapDispatchToProps)(withAuth(FullLayout))