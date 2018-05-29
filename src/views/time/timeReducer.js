import { TIME_SEARCH, TIME_CREATE, TIME_UPDATE, TIME_DELETE, TIME_HANDLER, TIME_SELECT, TIME_RESET } from './timeActions'

const initialState = { times: [], time: {} }

export default function (state = initialState, action) {
	switch (action.type) {
		case TIME_SEARCH:
			return {
				...state,
				times: action.payload.data
			};
		case TIME_CREATE:
		case TIME_UPDATE:
		case TIME_DELETE:
		case TIME_SELECT:
			return {
				...state,
				time: action.payload.data
			};
		case TIME_HANDLER:
			return {
				...state,
				time: {
					...state.time,
					[action.payload.name]: action.payload.value
				}
			};
		case TIME_RESET:
			return {
				...state,
				time: initialState.time
			}
		default:
			return state;
	}
}