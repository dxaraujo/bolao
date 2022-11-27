import Time from '../../features/time/time';
import Fase from '../../features/fase/fase';
import User from '../../features/user/user';
import Partida from '../../features/partida/partida';
import Resultado from '../../features/partida/resultado';
import Resultados from '../../features/partida/resultados';
import Palpites from '../../features/palpite/palpites';
import Palpite from '../../features/palpite/palpite';
import Classificacao from '../../features/classificacao/classificacao';
import Disputa from '../../features/disputa/disputa';
import Dashboard from '../../features/dashboard/dashboard';

const routes = [
	{ path: '/dashboard', component: Dashboard },
	{ path: '/classificacao', component: Classificacao },
	{ path: '/disputa', component: Disputa },
	{ path: '/resultados', component: Resultados },
	{ path: '/palpites', exact: true, component: Palpites },
	{ path: '/palpite/:faseId', component: Palpite },
	{ path: '/user', component: User },
	{ path: '/time', exact: undefined, component: Time },
	{ path: '/fase', component: Fase },
	{ path: '/partida', component: Partida },
	{ path: '/resultado', component: Resultado },
];

export default routes