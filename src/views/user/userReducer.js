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
			const users = ordenarUsuarios(action.payload.data)
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

const ordenarUsuarios = users => {
	return users.sort((u1, u2) =>   {
		const test0 = u2.totalAcumulado.valueOf() - u1.totalAcumulado.valueOf()
		if (test0 === 0) {
			const test1 = u2.placarCheio.valueOf() - u1.placarCheio.valueOf()
			if (test1 === 0) {
				const test2 = u2.placarTimeVencedorComGol.valueOf() - u1.placarTimeVencedorComGol.valueOf()
				if (test2 === 0) {
					const test3 = u2.placarTimeVencedor.valueOf() - u1.placarTimeVencedor.valueOf()
					if (test3 === 0 ) {
						return u2.placarGol.valueOf() - u1.placarGol.valueOf()
					}
					return test3
				}
				return test2
			}
			return test1
		}
		return test0
	})
}