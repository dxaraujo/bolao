import backendURI from '../../config'
import authFetch from '../../utils/fetchUtil'

const URL = `${backendURI}/api/palpite`

export const MONTAR_PALPITES = 'MONTAR_PALPITES';
export const UPDATE_PALPITES = 'UPDATE_PALPITES';
export const PALPITE_HANDLER = 'PALPITE_HANDLER';

export const montarGrupos = (user, fase) => {
	const response = authFetch(`${URL}/${user}/${fase}/montarpalpites`)
	return { type: MONTAR_PALPITES, payload: response }
}

export const updateAll = (palpites, user, fase) => {
	const response = authFetch(`${URL}/${user}/updatePalpites`, { method: 'PUT', body: JSON.stringify(palpites) })
	return async dispatch => {
		await dispatch({ type: UPDATE_PALPITES, payload: response })
		await montarGrupos(user, fase)
	};
}

export const handleChange = (name, value, palpite) => {
	return { type: PALPITE_HANDLER, payload: { name, value, palpite } }
}