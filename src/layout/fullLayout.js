import React, { Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux';
import { Redirect, Route, Switch } from 'react-router-dom'

import { Container, Badge } from 'reactstrap'
import { AppHeader, AppFooter, AppSidebar, AppSidebarHeader, AppSidebarForm, AppSidebarNav, AppSidebarFooter, AppSidebarMinimizer } from '@coreui/react'
import { ToastContainer } from "react-toastify";

import { search } from '../views/fase/faseActions'
import { navigationsLinks, navigationsPalpites, navigationsAdmin } from '../navigation';
import routes from '../router'

import Header from './header'
import Footer from './footer'
import withAuth from '../components/withAuth'
import If from '../components/if'

import blackAvatar from '../assets/img/blankavatar.png'

class FullLayout extends Component {
	constructor(props) {
		super(props)
		this.state = { nav: { items: this.proccessNavigation() }}
	}
	componentDidMount() {
		this.props.search()
		this.setState({ nav: { items: this.proccessNavigation() }})
	}
	componentWillReceiveProps() {
		this.props.search()
		this.setState({ nav: { items: this.proccessNavigation() }})
	}
	proccessNavigation() {
		let nav = []
		let newNavPalpites = []
		nav.push(...navigationsLinks)
		nav.push(...navigationsPalpites)
		this.props.fases.forEach(fase => {
			//if (fase.status) {
				newNavPalpites.push({
					name: `${fase.nome}`,
					url: `/palpite/${fase._id}`,
					icon: 'fas fa-futbol',
				})
			//}
		})
		nav.push(...newNavPalpites)
		nav.push(...navigationsAdmin)
		console.log(nav)
		return nav
	}
	render() {
		const navigation = this.state.nav
		const user = this.props.user 
		return (
			<div key={navigation} className='app'>
				<ToastContainer />
				<AppHeader fixed>
					<Header {...this.props} />
				</AppHeader>
				<div className='app-body'>
					<AppSidebar fixed display='lg'>
						<AppSidebarHeader>
							<div style={{ backgroundColor: '#494F54', padding: '20px' }}>
								<div style={{ maxHeight: '70px', textAlign: 'left' }}>
									<img alt='avatar' className='img-avatar' src={user ? user.avatar ? user.avatar : blackAvatar : blackAvatar} width='50px' height='50px' />
								</div>
								<div style={{ maxHeight: '20px', minHeight: '20px', textAlign: 'left', marginTop: '5px', marginBottom: '10px' }}>
									<span>{user ? user.nome : blackAvatar}</span>
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
						<If test={this.props.fases.length}>
							<AppSidebarNav navConfig={navigation} />
						</If>
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
	} yarn
}

const mapStateToProps = state => ({ user: state.userStore.loggedUser, fases: state.faseStore.fases })
const mapDispatchToProps = dispatch => bindActionCreators({ search }, dispatch)

export default withAuth(connect(mapStateToProps, mapDispatchToProps)(FullLayout))