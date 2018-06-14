import { backendURI } from '../../config'
import authFetch from '../../utils/fetchUtil'

const URL = `${backendURI}/api/palpite`

export const SEARCH_PALPITES = 'SEARCH_PALPITES';
export const MONTAR_PALPITES = 'MONTAR_PALPITES';
export const UPDATE_PALPITES = 'UPDATE_PALPITES';
export const PALPITE_HANDLER = 'PALPITE_HANDLER';

export const search = (user) => {
	const response = authFetch(`${URL}?user=${user._id}`)
	return { type: SEARCH_PALPITES, payload: response }
}

export const montarGrupos = (user, fase) => {
	const response = authFetch(`${URL}/${user}/${fase}/montarpalpites`)
	return { type: MONTAR_PALPITES, payload: response }
}

export const zerarGrupos = () => {
	return { type: MONTAR_PALPITES, payload: { data: [] } }
}

export const updateAll = (palpites, user, fase) => {
	const response = authFetch(`${URL}/${user}/updatePalpites`, { method: 'PUT', body: JSON.stringify(palpites) })
	return async dispatch => {
		await dispatch({ type: UPDATE_PALPITES, payload: response })
		await montarGrupos(user, fase)
	};
}

export const handleChange = (palpite, grupos) => {
	const g = updateGrupos(palpite, grupos)
	return { type: PALPITE_HANDLER, payload: { data: g } }
}

const updateGrupos = (palpite, grupos) => {
	let newGroups = []
	for (let i = 0; i < grupos.length; i++) {
		newGroups[i] = { nome: grupos[i].nome, rodadas: [] }
		for (let j = 0; j < grupos[i].rodadas.length; j++) {
			newGroups[i].rodadas[j] = { nome: grupos[i].rodadas[j].nome, palpites: [] }
			for (let k = 0; k < grupos[i].rodadas[j].palpites.length; k++) {
				newGroups[i].rodadas[j].palpites[k] = { ...grupos[i].rodadas[j].palpites[k] }
				if (grupos[i].rodadas[j].palpites[k]._id === palpite._id) {
					newGroups[i].rodadas[j].palpites[k] = { ...palpite }
				}
			}
		}
	}
	return newGroups
}