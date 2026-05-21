import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'
import { MatchStage, MatchStatus } from '@bolao/shared'

import { RootState } from '../../app/store'
import authFetch from '../../app/util/fetch'
import { backendURI } from '../../app/config/config'
import { TeamType } from '../time/timeSlice'

const URL = `${backendURI}/api/match`

export type HandleChangeType = {
	name:
		| 'id'
		| 'utcDate'
		| 'status'
		| 'matchday'
		| 'stage'
		| 'group'
		| 'homeTeam'
		| 'homeTeamScore'
		| 'awayTeam'
		| 'awayTeamScore'
	value: unknown
}

export type ResultadoHandleChangeType = {
	partida: MatchType
	handle: {
		name: 'homeTeamScore' | 'awayTeamScore'
		value: number | undefined
	}
}

export type MatchType = {
	_id?: string
	id: number
	utcDate: Date | string
	status: MatchStatus
	matchday: number
	stage: MatchStage
	group: string
	homeTeam?: TeamType
	awayTeam?: TeamType
	homeTeamScore?: number
	awayTeamScore?: number
	lastUpdated?: Date | string
}

/** @deprecated use MatchType */
export type PartidaType = MatchType

export interface PartidaState {
	partidas: MatchType[]
	partida: MatchType
}

const emptyMatch = (): MatchType => ({
	id: 0,
	utcDate: new Date(),
	status: MatchStatus.SCHEDULED,
	matchday: 0,
	stage: MatchStage.GROUP_STAGE,
	group: '',
})

const initialState: PartidaState = {
	partidas: [],
	partida: emptyMatch(),
}

export const getPartidasAsync = createAsyncThunk('partida/get', async (callback?: () => void) => {
	const response = await authFetch(`${URL}`)
	callback && callback()
	return response.data
})

export const getResultadosAsync = createAsyncThunk('partida/getResultado', async (callback?: () => void) => {
	const response = await authFetch(`${URL}/resultado`)
	callback && callback()
	return response.data
})

export const createPartidaAsync = createAsyncThunk(
	'partida/create',
	async (params: { partida: MatchType; callback?: () => void }) => {
		const response = await authFetch(`${URL}`, {
			method: 'POST',
			body: JSON.stringify({
				...params.partida,
				lastUpdated: params.partida.lastUpdated ?? new Date(),
			}),
		})
		params.callback && params.callback()
		return response.data
	},
)

export const updatePartidaAsync = createAsyncThunk(
	'partida/update',
	async (params: { partida: MatchType; callback?: () => void }) => {
		const response = await authFetch(`${URL}/${params.partida._id}`, {
			method: 'PUT',
			body: JSON.stringify(params.partida),
		})
		params.callback && params.callback()
		return response.data
	},
)

export const updateResultadoAsync = createAsyncThunk(
	'partida/updateResultado',
	async (params: { partida: MatchType; callback?: () => void }) => {
		const response = await authFetch(`${URL}/${params.partida._id}/updateResultado`, {
			method: 'PUT',
			body: JSON.stringify({
				homeTeamScore: params.partida.homeTeamScore,
				awayTeamScore: params.partida.awayTeamScore,
			}),
		})
		params.callback && params.callback()
		return response.data
	},
)

export const deletePartidaAsync = createAsyncThunk(
	'partida/delete',
	async (params: { partida: MatchType; callback?: () => void }, { dispatch }) => {
		const response = await authFetch(`${URL}/${params.partida._id}`, { method: 'DELETE' })
		dispatch(getPartidasAsync(params.callback))
		return response.data
	},
)

export const partidaSlice = createSlice({
	name: 'partida',
	initialState,
	reducers: {
		select: (state, action: PayloadAction<MatchType>) => {
			state.partida =
				state.partidas.find((partida) => partida._id === action.payload._id) || initialState.partida
		},
		create: (state) => {
			state.partida = emptyMatch()
		},
		handle: (state, action: PayloadAction<HandleChangeType>) => {
			state.partida = { ...state.partida, [action.payload.name]: action.payload.value }
		},
		handleResultado: (state, action: PayloadAction<ResultadoHandleChangeType>) => {
			const index = state.partidas.findIndex((partida) => partida._id === action.payload.partida._id)
			if (index >= 0) {
				state.partidas[index] = {
					...state.partidas[index],
					[action.payload.handle.name]: action.payload.handle.value,
				}
			}
		},
		reset: (state) => {
			state.partida = emptyMatch()
		},
	},
	extraReducers: (builder) => {
		builder
			.addCase(getPartidasAsync.pending, (state) => {
				state.partidas = initialState.partidas
			})
			.addCase(getPartidasAsync.fulfilled, (state, action) => {
				state.partidas = action.payload
			})
			.addCase(getResultadosAsync.pending, (state) => {
				state.partidas = initialState.partidas
			})
			.addCase(getResultadosAsync.fulfilled, (state, action) => {
				state.partidas = action.payload
			})
			.addCase(createPartidaAsync.fulfilled, (state, action) => {
				state.partida = action.payload
			})
			.addCase(updatePartidaAsync.fulfilled, (state, action) => {
				state.partida = action.payload
			})
			.addCase(updateResultadoAsync.fulfilled, (state, action) => {
				state.partida = action.payload
			})
	},
})

export const { select, create, handle, handleResultado, reset } = partidaSlice.actions

export const selectPartidas = (state: RootState) => state.partida.partidas
export const selectPartida = (state: RootState) => state.partida.partida

export default partidaSlice.reducer
