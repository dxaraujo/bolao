import { ComponentType } from 'react'

import Time from '../../features/time/time'
import Fase from '../../features/fase/fase'
import User from '../../features/user/user'
import Partida from '../../features/partida/partida'
import Resultado from '../../features/partida/resultado'
import Resultados from '../../features/partida/resultados'
import Palpites from '../../features/palpite/palpites'
import Palpite from '../../features/palpite/palpite'
import Classificacao from '../../features/classificacao/classificacao'
import Disputa from '../../features/disputa/disputa'
import Dashboard from '../../features/dashboard/dashboard'

export interface RouteDef {
	path: string
	component: ComponentType
}

const routes: RouteDef[] = [
	{ path: '/dashboard', component: Dashboard },
	{ path: '/classificacao', component: Classificacao },
	{ path: '/disputa', component: Disputa },
	{ path: '/resultados', component: Resultados },
	{ path: '/palpites', component: Palpites },
	{ path: '/palpite/:faseId', component: Palpite },
	{ path: '/user/*', component: User },
	{ path: '/time/*', component: Time },
	{ path: '/fase', component: Fase },
	{ path: '/partida/*', component: Partida },
	{ path: '/resultado', component: Resultado },
]

export default routes
