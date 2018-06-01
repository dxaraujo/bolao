import { USER_SEARCH, LOGIN, USER_UPDATE, SELECT_USER } from './userActions'

const initialState = { users: [], user: {}, selectedUser: {} }

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
		case SELECT_USER:
			const user = action.payload.data
			const newUsers = updateUser(user, state.users)
			return {
				...state,
				users: newUsers,
				selectedUser: user
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

const updateUser = (user, users) => {
	for(let i; i < users.length; i++) {
		if (users[i]._id = user._id) {
			users[i].isAdmin = user.isAdmin
		}
	}
	return users
}