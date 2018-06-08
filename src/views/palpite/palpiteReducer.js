import { SEARCH_PALPITES, MONTAR_PALPITES, UPDATE_PALPITES, PALPITE_HANDLER } from './palpiteActions'

const initialState = { grupos: [], palpites: [] }

export default function (state = initialState, action) {
	switch (action.type) {
		case SEARCH_PALPITES:
			return {
				...state,
				palpites: action.payload.data
			}
		case MONTAR_PALPITES:
		case PALPITE_HANDLER:
			return {
				...state,
				grupos: action.payload.data
			};
		case UPDATE_PALPITES:
			return { ...state };
		default:
			return state;
	}
}