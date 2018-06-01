import React from 'react'
import Loadable from 'react-loadable'

import FullLayout from './layout/fullLayout';

function Loading() {
	return <div>Loading...</div>;
}

const Dashboard = Loadable({
	loader: () => import('./views/dashboard/dashboard'),
	loading: Loading,
});

const Time = Loadable({
	loader: () => import('./views/time/time'),
	loading: Loading,
});

const Partida = Loadable({
	loader: () => import('./views/partida/partida'),
	loading: Loading,
});

const Palpite = Loadable({
	loader: () => import('./views/palpite/palpite'),
	loading: Loading,
});

const Classificacao = Loadable({
	loader: () => import('./views/classificacao/classificacao'),
	loading: Loading,
});

const Users = Loadable({
	loader: () => import('./views/user/users'),
	loading: Loading,
});

const routes = [
	{ path: '/', exact: true, component: FullLayout },
	{ path: '/dashboard', component: Dashboard },
	{ path: '/time', component: Time },
	{ path: '/partida', component: Partida },
	{ path: '/palpite', exact: true, component: Palpite },
	{ path: '/palpite/:fase', component: Palpite },
	{ path: '/classificacao', component: Classificacao },
	{ path: '/users', component: Users }
];

export default routes