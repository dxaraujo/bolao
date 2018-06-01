import { USER_SEARCH, LOGIN, USER_UPDATE, USER_SELECT, USER_RESET } from './userActions'

const initialState = { users: [], user: {}, selectedUser: null }

export default function (state = initialState, action) {
	switch (action.type) {
		case LOGIN:
			return {
				...state,
				user: action.payload
			};
		case USER_SEARCH:
			return {
				...state,
				users: action.payload.data
			};
		case USER_SELECT:
			return {
				...state,
				users: action.payload.users,
				selectedUser: action.payload.user
			};
		case USER_UPDATE:
			return {
				...state,
				selectedUser: action.payload.data
			};
		case USER_RESET:
			return {
				...state,
				selectedUser: initialState.selectedUser
			};
		default:
			return state;
	}
}