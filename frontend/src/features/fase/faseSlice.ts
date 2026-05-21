import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'
import { MatchStage, PhaseStatus } from '@bolao/shared'

import { RootState } from '../../app/store'
import authFetch from '../../app/util/fetch'
import { backendURI } from '../../app/config/config'

const URL = `${backendURI}/api/phase`

export type HandleChangeType = {
	fase: FaseType
	handle: {
		name: '_id' | 'status'
		value: PhaseStatus
	}
}

export type FaseType = {
	_id?: string
	name: string
	stage: MatchStage
	status: PhaseStatus
}

export interface FaseState {
	fases: FaseType[]
	fase: FaseType
	loadding: boolean
}

const initialState: FaseState = {
	fases: [],
	fase: { name: '', stage: MatchStage.GROUP_STAGE, status: PhaseStatus.DISABLED },
	loadding: false,
}

export const getFasesAsync = createAsyncThunk('fase/get', async (callback?: () => void) => {
	const response = await authFetch(`${URL}`)
	callback && callback()
	return response.data
})

export const updateFaseAsync = createAsyncThunk(
	'fase/update',
	async (params: { fase: FaseType; callback?: () => void }, { dispatch }) => {
		const response = await authFetch(`${URL}/${params.fase._id}`, {
			method: 'PUT',
			body: JSON.stringify({ status: params.fase.status }),
		})
		dispatch(getFasesAsync(params.callback))
		return response.data
	},
)

export const faseSlice = createSlice({
	name: 'fase',
	initialState,
	reducers: {
		selectFaseById: (state, action: PayloadAction<string>) => {
			state.fase = state.fases.find((fase) => fase._id === action.payload) || initialState.fase
		},
		handle: (state, action: PayloadAction<HandleChangeType>) => {
			const index = state.fases.findIndex((fase) => fase._id === action.payload.fase._id)
			if (index >= 0) {
				state.fases[index] = { ...state.fases[index], [action.payload.handle.name]: action.payload.handle.value }
			}
		},
	},
	extraReducers: (builder) => {
		builder.addCase(getFasesAsync.fulfilled, (state, action) => {
			state.fases = action.payload
		})
	},
})

export const { selectFaseById, handle } = faseSlice.actions

export const selectFases = (state: RootState) => state.fase.fases
export const selectFase = (state: RootState) => state.fase.fase
export const selectFasesLoadding = (state: RootState) => state.fase.loadding

export default faseSlice.reducer
