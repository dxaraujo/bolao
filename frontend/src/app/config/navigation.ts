export type NavigationType = {
	name: string,
	url?: string,
	icon?: string,
	title?: boolean
}

export const dashboardLinks: NavigationType[] = [
	{
		name: 'Dashboard',
		url: '/dashboard',
		icon: 'fas fa-star'
	}
]

export const classificacaoLinks: NavigationType[] = [
	{
		name: 'Classificação',
		url: '/classificacao',
		icon: 'fas fa-medal'
	}, {
		name: 'Diputa',
		url: '/disputa',
		icon: 'fas fa-fire'
	}, {
		name: 'Resultados',
		url: '/resultados',
		icon: 'fas fa-futbol'
	}
]

export const navigationsConsultarPalpites: NavigationType[] = [{
	name: 'Consultar Palpites',
	url: '/palpites',
	icon: 'fas fa-clipboard-list'
}]

export const navigationsPalpites: NavigationType[] = [
	{
		title: true,
		name: 'Palpites'
	}
]

export const navigationsAdmin: NavigationType[] = [
	{
		title: true,
		name: 'Administração'
	}, {
		name: 'Resultados',
		url: '/resultado',
		icon: 'fas fa-database'
	}, {
		name: 'Usuários',
		url: '/user',
		icon: 'fas fa-database'
	}, {
		name: 'Times',
		url: '/time',
		icon: 'fas fa-database'
	}, {
		name: 'Fases',
		url: '/fase',
		icon: 'fas fa-database'
	}, {
		name: 'Partidas',
		url: '/partida',
		icon: 'fas fa-database'
	}
]