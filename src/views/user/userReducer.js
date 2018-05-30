import { USER_SEARCH, LOGIN, USER_UPDATE, USER_HANDLER } from './userActions'

const initialState = { users: [], loggedUser: {} }

export default function (state = initialState, action) {
	switch (action.type) {
		case USER_SEARCH:
			return {
				...state,
				users: action.payload.data
			};
		case LOGIN:
		case USER_UPDATE:
			return {
				...state,
				loggedUser: action.payload.data
			};
		case USER_HANDLER:
			return {
				...state,
				loggedUser: {
					...state.loggedUser,
					[action.payload.name]: action.payload.value
				}
			};
		default:
			return state;
	}
}