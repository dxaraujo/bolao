import { FASE_SEARCH, FASE_SELECT, FASE_HANDLE_CHANGE, FASE_UPDATE } from './faseActions'

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
		case FASE_HANDLE_CHANGE:
			return {
				...state,
				fases: action.payload
			}
		case FASE_UPDATE:
			return {
				...state,
				fase: action.payload.data
			}
		default:
			return state;
	}
}