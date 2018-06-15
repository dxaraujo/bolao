import { backendURI } from '../../config'
import authFetch from '../../utils/fetchUtil'

const URL = `${backendURI}/api/partida`

const submit = (partida, method, action) => {
	const id = partida._id ? partida._id : ''
	delete partida._id
	const response = authFetch(`${URL}/${id}`, { method: method, body: JSON.stringify(partida) })
	return [{ type: action, payload: response }, search()]
}

export const PARTIDA_SEARCH = 'PARTIDA_SEARCH';
export const PARTIDA_UPDATE = 'PARTIDA_UPDATE';
export const PARTIDA_CREATE = 'PARTIDA_CREATE';
export const PARTIDA_DELETE = 'PARTIDA_DELETE';
export const PARTIDA_HANDLER = 'PARTIDA_HANDLER';
export const PARTIDA_HANDLER_RESULTADO = 'PARTIDA_HANDLER_RESULTADO';
export const PARTIDA_SELECT = 'PARTIDA_SELECT';
export const PARTIDA_RESET = 'PARTIDA_RESET';

export const search = () => {
	const response = authFetch(URL)
	return { type: PARTIDA_SEARCH, payload: response }
}

export const searchResultado = () => {
	const response = authFetch(`${URL}/resultado`)
	return { type: PARTIDA_SEARCH, payload: response }
}

export const create = partida => {
	return submit(partida, 'POST', PARTIDA_CREATE)
}

export const update = partida => {
	return submit(partida, 'PUT', PARTIDA_UPDATE)
}

export const updateResultado = partida => {
	const response = authFetch(`${URL}/${partida._id}/updateResultado`, { method: 'PUT', body: JSON.stringify({ placarTimeA: partida.placarTimeA, placarTimeB: partida.placarTimeB }) })
	return { type: PARTIDA_UPDATE, payload: response }
}

export const remove = partida => {
	return submit(partida, 'DELETE', PARTIDA_DELETE)
}

export const handleChange = event => {
	const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value
	return { type: PARTIDA_HANDLER, payload: { name: event.target.name, value: value } }
}

export const select = partida => {
	return { type: PARTIDA_SELECT, payload: { data: { ...partida } } }
}

export const reset = () => {
	return { type: PARTIDA_RESET }
}

export const handleChangeResultado = (name, value, partida, partidas) => {
	const p = updatePartida(name, value, partida, partidas)
	return { type: PARTIDA_HANDLER_RESULTADO, payload: { partida, partidas: p } }
}

const updatePartida = (name, value, partida, partidas) => {
	let newPartidas = []
	for (let i = 0; i < partidas.length; i++) {
		newPartidas[i] = { ...partidas[i] }
		if (partidas[i]._id === partida._id) {
			newPartidas[i][name] = value
		}
	}
	return newPartidas
}