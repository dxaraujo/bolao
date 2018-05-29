import { search as searchTimes } from '../time/timeActions'
import { search as searchPartidas } from '../partida/partidaActions'

import { montarPartidas } from '../../utils/partidasUtil'

export const MONTAR_GRUPOS = 'MONTAR_GRUPOS';

export const montarGrupos = (fase) => {
	return async dispatch => {
		const times = await dispatch(searchTimes())
		const partidas = await dispatch(searchPartidas())
		dispatch({
			type: MONTAR_GRUPOS,
			payload: montarPartidas(partidas.payload.data, times.payload.data, fase)
		})
	}
}