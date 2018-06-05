import moment from 'moment'

import { PARTIDA_SEARCH, PARTIDA_CREATE, PARTIDA_UPDATE, PARTIDA_DELETE, PARTIDA_HANDLER, PARTIDA_HANDLER_RESULTADO, PARTIDA_SELECT, PARTIDA_RESET, PARTIDA_RESET_RESULTADO } from './partidaActions'

const initialState = { partidas: [], partida: {}, selectedPartida: null }

export default function (state = initialState, action) {
	switch (action.type) {
		case PARTIDA_SEARCH:
			const partidas = updateData(action.payload.data)
			return {
				...state,
				partidas
			};
		case PARTIDA_CREATE:
		case PARTIDA_UPDATE:
		case PARTIDA_DELETE:
		case PARTIDA_SELECT:
			return {
				...state,
				partida: action.payload.data
			};
		case PARTIDA_HANDLER:
			return {
				...state,
				partida: {
					...state.partida,
					[action.payload.name]: action.payload.value
				}
			};
		case PARTIDA_HANDLER_RESULTADO:
			return {
				...state,
				partidas: action.payload.partidas,
				selectedPartida: action.payload.partida
			}
		case PARTIDA_RESET:
			return {
				...state,
				partida: initialState.partida
			}
		case PARTIDA_RESET_RESULTADO:
			return {
				...state,
				selectedPartida: initialState.selectedPartida
			}
		default:
			return state;
	}
}

const updateData = partidas => {
	partidas.forEach(partida => {
		partida.data = moment(partida.data, 'YYYY-MM-DDThh:mm:ss').format('DD/MM/YYYY HH:mm:ss')
	});
	return partidas
}