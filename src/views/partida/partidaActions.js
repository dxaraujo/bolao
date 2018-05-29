import URL from '../config'

const authFetch = (url, options) => {
	const headers = { 'Accept': 'application/json', 'Content-Type': 'application/json' }
	const token = localStorage.getItem('jwt_token')
	if (token) {
		headers['Authorization'] = 'Bearer ' + token
	}
	return fetch(url, { headers, ...options }).then(response => response.json())
}

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
export const PARTIDA_SELECT = 'PARTIDA_SELECT';
export const PARTIDA_RESET = 'PARTIDA_RESET';

export const search = () => {
	const response = authFetch(URL)
	return { type: PARTIDA_SEARCH, payload: response }
}

export const create = partida => {
	return submit(partida, 'POST', PARTIDA_CREATE)
}

export const update = partida => {
	return submit(partida, 'PUT', PARTIDA_UPDATE)
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