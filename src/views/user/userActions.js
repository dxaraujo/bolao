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
export const USER_AUTHENTICATED = 'USER_AUTHENTICATED';
export const USER_SEARCH = 'USER_SEARCH';
export const USER_SEARCH_ATIVOS = 'USER_SEARCH_ATIVOS';
export const USER_UPDATE = 'USER_UPDATE';
export const USER_UPDATE_LIST = 'USER_UPDATE_LIST';
export const USER_REMOVE = 'USER_REMOVE';
export const USER_SELECT = 'USER_SELECT';

export const setUser = user => {
	return { type: LOGIN, payload: user }
}

export const getAuthenticatedUser = () => {
	const response = authFetch(`${URL}/authenticated`)
	return { type: USER_AUTHENTICATED, payload: response }
}

export const search = () => {
	const response = authFetch(URL)
	return { type: USER_SEARCH, payload: response }
}

export const searchAtivos = () => {
	const response = authFetch(`${URL}?ativo=true`)
	return { type: USER_SEARCH, payload: response }
}

export const update = user => {
	return submit({ _id: user._id, isAdmin: user.isAdmin, ativo: user.ativo }, 'PUT', USER_UPDATE)
}

export const remove = user => {
	return submit({ _id: user._id }, 'DELETE', USER_REMOVE)
}

export const handleChange = (user, users) => {
	const us = updateUser(user, users)
	return { type: USER_UPDATE_LIST, payload: { data: us } }
}

export const select = (user) => {
	return { type: USER_SELECT, payload: { data: user } }
}

const updateUser = (user, users) => {
	let newUsers = []
	for (let i = 0; i < users.length; i++) {
		newUsers[i] = { ...users[i] }
		if (users[i]._id === user._id) {
			newUsers[i].isAdmin = user.isAdmin
			newUsers[i].ativo = user.ativo
		}
	}
	return newUsers
}