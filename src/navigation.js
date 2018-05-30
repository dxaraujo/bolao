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
		name: 'Resultado',
		url: '/resultado',
		icon: 'fas fa-clipboard-check'
	}
]

export { navigationsLinks, navigationsPalpites, navigationsAdmin }