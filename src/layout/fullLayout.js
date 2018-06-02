import React, { Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux';
import { Redirect, Route, Switch } from 'react-router-dom'

import { Container } from 'reactstrap'
import { AppHeader, AppFooter, AppSidebar, AppSidebarHeader, AppSidebarNav, AppSidebarMinimizer } from '@coreui/react'
import { ToastContainer } from "react-toastify";

import { search } from '../views/fase/faseActions'
import { navigationsLinks, navigationsPalpites, navigationsAdmin } from '../navigation';
import routes from '../router'

import Header from './header'
import Footer from './footer'
import withAuth from '../components/withAuth'

import blackAvatar from '../assets/img/blankavatar.svg'

class FullLayout extends Component {
	constructor(props) {
		super(props)
		this.state = { nav: { items: [] } }
	}
	componentWillMount() {
		this.props.search()

	}
	componentWillReceiveProps(nextProps) {
		this.proccessNavigation(nextProps.fases)
	}
	proccessNavigation(fases) {

		let navv = []
		let newNavPalpites = []

		navv.push(...navigationsLinks)
		navv.push(...navigationsPalpites)

		fases.forEach(fase => {
			if (fase.status) {
				newNavPalpites.push({
					name: `${fase.nome}`,
					url: `/palpite/${fase.nome}`,
					icon: 'fas fa-futbol',
				})
			}
		})

		navv.push(...newNavPalpites)

		if (this.props.getAuthenticatedUser().isAdmin) {
			navv.push(...navigationsAdmin)
		}

		this.setState({ nav: { items: navv } })
	}
	render() {
		const navigation = this.state.nav
		const user = this.props.getAuthenticatedUser()
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
										<img alt='avatar' className='img-avatar' src={user.avatar ? user.avatar : blackAvatar} />
									</div>
									<div />
									<div>
										<span className='d-block' style={{ textAlign: 'left' }}>  {user.name}</span>
									</div>
								</div>
							</div>
						</AppSidebarHeader>
						<AppSidebarNav navConfig={navigation} />
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
	} yarn
}

const mapStateToProps = state => ({ fases: state.faseStore.fases })
const mapDispatchToProps = dispatch => bindActionCreators({ search }, dispatch)

export default withAuth(connect(mapStateToProps, mapDispatchToProps)(FullLayout))