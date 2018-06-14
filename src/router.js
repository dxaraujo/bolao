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

const Palpites = Loadable({
	loader: () => import('./views/palpite/palpites'),
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

const Resultado = Loadable({
	loader: () => import('./views/resultado/resultado'),
	loading: Loading,
});

const routes = [
	{ path: '/', exact: true, component: FullLayout },
	{ path: '/dashboard', component: Dashboard },
	{ path: '/time', component: Time },
	{ path: '/partida', component: Partida },
	{ path: '/palpites', exact: true, component: Palpites },
	{ path: '/palpite/:fase', component: Palpite },
	{ path: '/classificacao', component: Classificacao },
	{ path: '/users', component: Users },
	{ path: '/resultados', component: Resultado },
];

export default routes