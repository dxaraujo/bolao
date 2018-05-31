import { MONTAR_PALPITES, PALPITE_HANDLER } from './palpiteActions'

const initialState = { grupos: [] }

export default function (state = initialState, action) {
	switch (action.type) {
		case MONTAR_PALPITES:
			return {
				...state,
				grupos: action.payload.data
			};
		case PALPITE_HANDLER:
			return {
				...state,
				grupos: update(state.grupos, ...action.payload)
			};
		default:
			return state;
	}
}

const update = (grupos, palpite, name, value) => {
	grupos.forEach(grupo => {
		grupo.rodadas.forEach(rodada => {
			rodada.palpites.forEach(palp => {
				if (palp === palpite) {
					palp[name] = value
				}
			})
		})
	})
	return grupos
}