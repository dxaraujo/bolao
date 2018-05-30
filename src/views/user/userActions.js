import backendURI from '../../config'

const URL = `${backendURI}/api/user`

const authFetch = (url, options) => {
	const headers = { 'Accept': 'application/json', 'Content-Type': 'application/json' }
	const token = localStorage.getItem('jwt_token')
	if (token) {
		headers['Authorization'] = 'Bearer ' + token
	}
	return fetch(url, { headers, ...options }).then(response => response.json())
}

const submit = (user, method, action) => {
	const id = user._id ? user._id : ''
	delete user._id
	const response = authFetch(`${URL}/${id}`, { method: method, body: JSON.stringify(user) })
	return [{ type: action, payload: response }, search()]
}

export const LOGIN = "LOGIN";
export const USER_SEARCH = 'USER_SEARCH';
export const USER_UPDATE = 'USER_UPDATE';
export const USER_HANDLER = 'USER_HANDLER';

export const loggedUser = user => {
	return { type: LOGIN, payload: { data: user } }
}

export const search = () => {
	const response = authFetch(URL)
	return { type: USER_SEARCH, payload: response }
}

export const update = user => {
	return submit(user, 'PUT', USER_UPDATE)
}

export const handleChange = event => {
	return { type: USER_HANDLER, payload: { name: event.target.name, value: event.target.value } }
}