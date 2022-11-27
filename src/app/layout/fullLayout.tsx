import { useEffect } from 'react'
import { useAppSelector, useAppDispatch } from '../hooks'
import { Switch, Route, Redirect } from 'react-router-dom'
import { Container } from 'reactstrap'
import { AppHeader, AppFooter, AppSidebar, AppSidebarHeader, AppSidebarNav, AppSidebarMinimizer } from '@coreui/react'
import { ToastContainer } from "react-toastify"

import { UserType } from '../../features/user/userSlice'
import { getAuthUserAsync, selectAuthUser } from '../auth/authSlice'
import { FaseType, getFasesAsync, selectFases } from '../../features/fase/faseSlice'
import { selectLoading } from '../../features/loading/loadingSlice'
import Loading from '../../features/loading/loading'

import { dashboardLinks, classificacaoLinks, navigationsConsultarPalpites, navigationsPalpites, navigationsAdmin, NavigationType } from '../config/navigation'
import routes from '../config/router'
import { rootUser } from '../config/config'

import Header from './header'
import Footer from './footer'
import If from '../components/if'

import blankavatar from '../../assets/img/blankavatar.svg'
import withAuth from '../auth/withAuth'

const proccessNavigation = (fases?: FaseType[], authUser?: UserType): { items: NavigationType[] } => {
	let navv: { items: NavigationType[] } = { items: [] }
	navv.items.push(...dashboardLinks)
	if (authUser && authUser.ativo) {
		navv.items.push(...classificacaoLinks)
		navv.items.push(...navigationsConsultarPalpites)
	}
	let newNavPalpites: NavigationType[] = []
	navv.items.push(...navigationsPalpites)
	if (fases) {
		fases.forEach(fase => {
			if (fase.status === 'A' || fase.status === 'B') {
				newNavPalpites.push({
					name: `${fase.nome}`,
					url: `/palpite/${fase._id}`,
					icon: 'fas fa-futbol',
				})
			}
		})
	}
	navv.items.push(...newNavPalpites)
	if (authUser && (authUser.isAdmin || authUser.email === rootUser)) {
		navv.items.push(...navigationsAdmin)
	}
	return navv
}

const fullLayout = () => {

	const dispatch = useAppDispatch()
	const user = useAppSelector(selectAuthUser)
	const fases = useAppSelector(selectFases)
	const loading = useAppSelector(selectLoading)

	useEffect(() => {
		dispatch(getAuthUserAsync())
	}, [])

	useEffect(() => {
		dispatch(getFasesAsync())
	}, [])

	return (
		<>
		<Loading show={loading}/>
		<div className='app'>
			<ToastContainer />
			<AppHeader fixed>
				<Header />
			</AppHeader>
			<div className='app-body'>
				<AppSidebar key={'appSideBar'} fixed display='lg'>
					<AppSidebarHeader>
						<div style={{ backgroundColor: '#494F54', padding: '10px 5px 10px 5px' }}>
							<div style={{ display: 'grid', gridTemplateColumns: '50px 5px 1fr', alignItems: 'center' }}>
								<div>
									<img alt='avatar' src={user ? `${user.picture}?sz=200` : blankavatar} className='img-avatar' width={50} height={50} referrerPolicy='no-referrer' />
								</div>
								<div />
								<div>
									<span className='d-block' style={{ textAlign: 'left' }}>  {user ? user.name : ''}</span>
								</div>
							</div>
						</div>
					</AppSidebarHeader>
					<AppSidebarNav navConfig={proccessNavigation(fases, user)} />
					<AppSidebarMinimizer />
				</AppSidebar>
				<main className='main'>
					<If test={user !== undefined}>
						<Container fluid>
							<Switch>
								{routes.map((route, idx) => {
									return route.component ? (<Route key={idx} path={route.path} exact={route.exact} component={route.component} />) : (null);
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
		</>
	)
}

export default withAuth(fullLayout)