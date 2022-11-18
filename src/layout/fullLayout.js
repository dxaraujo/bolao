import React, { Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux';
import { Redirect, Route, Switch } from 'react-router-dom'

import { Container } from 'reactstrap'
import { AppHeader, AppFooter, AppSidebar, AppSidebarHeader, AppSidebarNav, AppSidebarMinimizer } from '@coreui/react'
import { ToastContainer } from "react-toastify";

import { getAuthenticatedUser } from '../views/user/userActions'
import { search } from '../views/fase/faseActions'
import { dashboardLinks, classificacaoLinks, navigationsConsultarPalpites, navigationsPalpites, navigationsAdmin } from '../navigation';
import routes from '../router'

import Header from './header'
import Footer from './footer'
import withAuth from '../components/withAuth'
import If from '../components/if'

import { rootUser } from '../config'
import blankavatar from '../assets/img/blankavatar.svg'

class FullLayout extends Component {

	constructor(props) {
		super(props)
		this.state = { nav: { items: [] } }
	}

	componentWillMount() {
		this.props.getAuthenticatedUser()
		this.props.search()
	}

	componentWillReceiveProps(nextProps) {
		if (this.props.authenticatedUser) {
			this.proccessNavigation(nextProps.fases)
		}
	}

	proccessNavigation(fases) {

		let navv = []
		let newNavPalpites = []

		navv.push(...dashboardLinks)
		if (this.props.authenticatedUser.ativo) {
			navv.push(...classificacaoLinks)
			navv.push(...navigationsConsultarPalpites)
		}

		navv.push(...navigationsPalpites)
		fases.forEach(fase => {
			if (fase.status === 'A' || fase.status === 'B') {
				newNavPalpites.push({
					name: `${fase.nome}`,
					url: `/palpite/${fase._id}`,
					icon: 'fas fa-futbol',
				})
			}
		})
		navv.push(...newNavPalpites)

		if (this.props.authenticatedUser.isAdmin || this.props.authenticatedUser.email === rootUser) {
			navv.push(...navigationsAdmin)
		}

		this.setState({ nav: { items: navv } })
	}

	render() {
		const user = this.props.authenticatedUser
		const navigation = this.state.nav
		return (
			<div className='app'>
				<ToastContainer />
				<AppHeader fixed>
					<Header {...this.props} />
				</AppHeader>
				<div className='app-body'>
					<AppSidebar key={navigation} fixed display='lg'>
						<AppSidebarHeader>
							<div style={{ backgroundColor: '#494F54', padding: '10px 5px 10px 5px' }}>
								<div style={{ display: 'grid', gridTemplateColumns: '50px 5px 1fr', alignItems: 'center' }}>
									<div>
										<img alt='avatar' src={user ? user.picture : blankavatar} className='img-avatar' width={50} height={50} />
									</div>
									<div />
									<div>
										<span className='d-block' style={{ textAlign: 'left' }}>  {user ? user.name : ''}</span>
									</div>
								</div>
							</div>
						</AppSidebarHeader>
						<AppSidebarNav navConfig={navigation} />
						<AppSidebarMinimizer />
					</AppSidebar>
					<main className='main'>
						<If test={user !== undefined}>
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
						</If>
					</main>
				</div>
				<AppFooter fixed>
					<Footer />
				</AppFooter>
			</div>
		)
	}
}

const mapStateToProps = state => ({ fases: state.faseStore.fases, authenticatedUser: state.userStore.authenticatedUser })
const mapDispatchToProps = dispatch => bindActionCreators({ search, getAuthenticatedUser }, dispatch)

export default withAuth(connect(mapStateToProps, mapDispatchToProps)(FullLayout))