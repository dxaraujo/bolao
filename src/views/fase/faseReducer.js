import { FASE_SEARCH, FASE_SELECT } from './faseActions'

const initialState = { fases: [], fase: {} }

export default function (state = initialState, action) {
	switch (action.type) {
		case FASE_SEARCH:
			return {
				...state,
				fases: action.payload.data
			}
		case FASE_SELECT:
			const fase = state.fases.find(fase => fase._id === action.payload.data) || {}
			return {
				...state,
				fase
			}
		default:
			return state;
	}
}