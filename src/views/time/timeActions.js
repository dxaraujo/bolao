import backendURI from '../../config'
import authFetch from '../../utils/fetchUtil'

const URL = `${backendURI}/api/time`

const submit = (time, method, action) => {
	const id = time._id ? time._id : ''
	delete time._id
	const response = authFetch(`${URL}/${id}`, { method: method, body: JSON.stringify(time) })
	return [{ type: action, payload: response }, search()]
}

export const TIME_SEARCH = 'TIME_SEARCH';
export const TIME_UPDATE = 'TIME_UPDATE';
export const TIME_CREATE = 'TIME_CREATE';
export const TIME_DELETE = 'TIME_DELETE';
export const TIME_HANDLER = 'TIME_HANDLER';
export const TIME_SELECT = 'TIME_SELECT';
export const TIME_RESET = 'TIME_RESET';

export const search = () => {
	const response = authFetch(URL)
	return { type: TIME_SEARCH, payload: response }
}

export const create = time => {
	return submit(time, 'POST', TIME_CREATE)
}

export const update = time => {
	return submit(time, 'PUT', TIME_UPDATE)
}

export const remove = time => {
	return submit(time, 'DELETE', TIME_DELETE)
}

export const handleChange = event => {
	return { type: TIME_HANDLER, payload: { name: event.target.name, value: event.target.value } }
}

export const select = time => {
	return { type: TIME_SELECT, payload: { data: { ...time } } }
}

export const reset = () => {
	return { type: TIME_RESET }
}