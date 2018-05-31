import backendURI from '../../config'
import authFetch from '../../utils/fetchUtil'

const URL = `${backendURI}/api/palpite`

export const MONTAR_PALPITES = 'MONTAR_PALPITES';
export const PALPITE_HANDLER = 'PALPITE_HANDLER';

export const montarGrupos = (userId, fase) => {
	const response = authFetch(`${URL}/${userId}/${fase}/montarpalpites`)
	return { type: MONTAR_PALPITES, payload: response }
}

export const handleChange = (event, palpite, grupos) => {
	return { type: PALPITE_HANDLER, payload: { palpite, name: event.target.name, value: event.target.value } }
}