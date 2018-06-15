import { USER_SEARCH, LOGIN, USER_UPDATE, USER_SELECT } from './userActions'

const initialState = { users: [], user: {}}

export default function (state = initialState, action) {
	switch (action.type) {
		case LOGIN:
			return {
				...state,
				user: action.payload
			};
		case USER_SEARCH:
			const users = ordenerUsuarios(action.payload.data)
			return {
				...state,
				users
			};
		case USER_SELECT:
			return {
				...state,
				users: action.payload.users
			};
		case USER_UPDATE:
			return {
				...state,
				selectedUser: action.payload.data
			};
		default:
			return state;
	}
}

const ordenerUsuarios = users => {
	return users.sort((u1, u2) => u1.classificacao.valueOf() - u2.classificacao.valueOf())
}