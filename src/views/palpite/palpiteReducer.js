import { MONTAR_PALPITES, UPDATE_PALPITES, PALPITE_HANDLER } from './palpiteActions'

const initialState = { grupos: [] }

export default function (state = initialState, action) {
	switch (action.type) {
		case MONTAR_PALPITES:
			return {
				...state,
				grupos: action.payload.data
			};
		case UPDATE_PALPITES:
			console.log(action.payload.data)
			return {...state};
		case PALPITE_HANDLER:
			return {
				...state,
				grupos: update(state.grupos, action.payload.palpite, action.payload.name, action.payload.value)
			};
		default:
			return state;
	}
}

const update = (grupos, palpite, name, value) => {
	grupos.forEach(grupo => {
		grupo.rodadas.forEach(rodada => {
			rodada.palpites.forEach(palp => {
				if (palp._id === palpite._id) {
					console.log(name)
					console.log(value)
					palp[name] = value
				}
			})
		})
	})
	return grupos
}