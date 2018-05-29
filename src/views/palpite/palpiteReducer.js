import { MONTAR_GRUPOS } from './palpiteActions'

const initialState = { grupos: [] }

export default function (state = initialState, action) {
	switch (action.type) {
		case MONTAR_GRUPOS:
			return {
				...state,
				grupos: action.payload
			};
		default:
			return state;
	}
}