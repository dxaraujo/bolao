import { backendURI } from '../../config'
import authFetch from '../../utils/fetchUtil'

const URL = `${backendURI}/api/fase`

const submit = (fase, method, action) => {
	const id = fase._id ? fase._id : ''
	delete fase._id
	const response = authFetch(`${URL}/${id}`, { method: method, body: JSON.stringify(fase) })
	return [{ type: action, payload: response }, search()]
}

export const FASE_SEARCH = 'FASE_SEARCH';
export const FASE_SELECT = 'FASE_SELECT';
export const FASE_UPDATE = 'FASE_UPDATE';
export const FASE_HANDLE_CHANGE = 'FASE_HANDLE_CHANGE';

export const search = (faseId) => {
	const response = authFetch(URL)
	if (faseId) {
		return [{ type: FASE_SEARCH, payload: response }, { type: FASE_SELECT, payload: { data: faseId } }]
	}
	return { type: FASE_SEARCH, payload: response }
}

export const update = fase => {
	return submit({ _id: fase._id, status: fase.status }, 'PUT', FASE_UPDATE)
}

export const handleChange = (fase, fases) => {
	const f = updateFase(fase, fases)
	return { type: FASE_HANDLE_CHANGE, payload: f }
}

const updateFase = (fase, fases) => {
	let newFases = []
	for (let i = 0; i < fases.length; i++) {
		newFases[i] = { ...fases[i] }
		if (fases[i]._id === fase._id) {
			newFases[i].status = fase.status
		}
	}
	return newFases
}