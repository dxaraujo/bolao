import { backendURI } from '../../config'
import authFetch from '../../utils/fetchUtil'

const URL = `${backendURI}/api/user`

const submit = (user, method, action) => {
	const id = user._id ? user._id : ''
	delete user._id
	const response = authFetch(`${URL}/${id}`, { method: method, body: JSON.stringify(user) })
	return [{ type: action, payload: response }, search()]
}

export const LOGIN = "LOGIN";
export const USER_SEARCH = 'USER_SEARCH';
export const USER_UPDATE = 'USER_UPDATE';
export const USER_SELECT = 'USER_SELECT';
export const USER_RESET = 'USER_RESET';

export const setUser = user => {
	return { type: LOGIN, payload: user }
}

export const search = () => {
	const response = authFetch(URL)
	return { type: USER_SEARCH, payload: response }
}

export const update = user => {
	return submit({_id: user._id, isAdmin: user.isAdmin}, 'PUT', USER_UPDATE)
}

export const handleChange = (user, users) => {
	users = updateUser(user, users)
	return { type: USER_SELECT, payload: {user, users} }
}

export const reset = () => {
	return [{type: USER_RESET, payload: null}, search()]
}

const updateUser = (user, users) => {
	for(let i; i < users.lenght; i++) {
		if (users[i]._id === user._id) {
			users[i].isAdmin = user.isAdmin
		}
	}
	return users
}