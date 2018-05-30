import { USER_SEARCH, LOGIN, USER_UPDATE, USER_HANDLER } from './userActions'

const initialState = { users: [], user: {} }

export default function (state = initialState, action) {
	switch (action.type) {
		case LOGIN:
			return {
				...state,
				user: action.payload
			};
		case USER_UPDATE:
			return {
				...state,
				user: action.payload.data
			};
		case USER_HANDLER:
			return {
				...state,
				loggedUser: {
					...state.user,
					[action.payload.name]: action.payload.value
				}
			};
		case USER_SEARCH:
			return {
				...state,
				users: action.payload.data
			};
		default:
			return state;
	}
}