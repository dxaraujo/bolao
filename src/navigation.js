const navigationsLinks = [{
	name: 'Dashboard',
	url: '/dashboard',
	icon: 'fas fa-tachometer-alt'
}, {
	name: 'Classificação',
	url: '/classificacao',
	icon: 'fas fa-star'
}
]

const navigationsPalpites = [
	{
		title: true,
		name: 'Palpites'
	}
]

const navigationsAdmin = [
	{
		title: true,
		name: 'Administração'
	}, {
		name: 'Times',
		url: '/time',
		icon: 'fas fa-database'
	}, {
		name: 'Partidas',
		url: '/partida',
		icon: 'fas fa-database'
	}, {
		name: 'Usuários',
		url: '/users',
		icon: 'fas fa-database'
	}
]

export { navigationsLinks, navigationsPalpites, navigationsAdmin }