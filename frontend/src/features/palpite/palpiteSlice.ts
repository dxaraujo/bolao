import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { PontosObtidos } from '@bolao/shared'

import { RootState } from '../../app/store'
import authFetch from '../../app/util/fetch'
import { backendURI } from '../../app/config/config'
import { UserType } from '../user/userSlice'
import { MatchType } from '../partida/partidaSlice'

const URL = `${backendURI}/api/bet`

export type HandleChangeType = {
	palpite: PalpiteType
	handle: {
		name: 'homeTeamScore' | 'awayTeamScore'
		value: number
	}
}

export type GrupoType = {
	nome: string
	rodadas: RodadaType[]
}

export type RodadaType = {
	nome: string
	bets: PalpiteType[]
}

export type PalpiteType = {
	_id?: string
	user?: UserType
	match?: MatchType
	homeTeamScore?: number
	awayTeamScore?: number
	totalPontosObitidos?: PontosObtidos
	placarCheio?: boolean
	placarTimeVencedorComGol?: boolean
	placarTimeVencedor?: boolean
	placarGol?: boolean
	classificacao?: number
	classificacaoAnterior?: number
	totalAcumulado?: number
}

export interface PalpiteState {
	palpites: PalpiteType[] | undefined
	palpite: PalpiteType | undefined
	grupos: GrupoType[] | undefined
	tabIndex: number
}

const initialState: PalpiteState = {
	palpites: undefined,
	palpite: undefined,
	grupos: undefined,
	tabIndex: 0,
}

export const getPalpitesAsync = createAsyncThunk(
	'palpites/montarGrupos',
	async (params: { userId: string; faseId: string; callback: () => void }) => {
		const response = await authFetch(`${URL}/${params.userId}/${params.faseId}/montarbets`)
		params.callback()
		return response.data
	},
)

export const updatePalpitesAsync = createAsyncThunk(
	'palpites/update',
	async (params: { palpites: PalpiteType[]; userId: string; faseId: string; callback: () => void }) => {
		const body = params.palpites.map((p) => ({
			_id: p._id,
			homeTeamScore: p.homeTeamScore,
			awayTeamScore: p.awayTeamScore,
		}))
		const response = await authFetch(`${URL}/${params.userId}/updateBets`, {
			method: 'PUT',
			body: JSON.stringify(body),
		})
		params.callback()
		return response.data
	},
)

export const palpiteSlice = createSlice({
	name: 'palpite',
	initialState,
	reducers: {
		selectPalpiteById: (state, action: PayloadAction<string>) => {
			if (state.palpites) {
				state.palpite = state.palpites.find((palpite) => palpite._id === action.payload) || undefined
			}
		},
		handle: (state, action: PayloadAction<HandleChangeType>) => {
			if (state.palpites) {
				const palpite = state.palpites.find((p) => p._id === action.payload.palpite._id)
				if (palpite) {
					palpite[action.payload.handle.name] = action.payload.handle.value
				}
			}
		},
		handleGrupos: (state, action: PayloadAction<{ palpite: PalpiteType; tabIndex: number }>) => {
			state.grupos = updateGrupos(action.payload.palpite, state.grupos)
			state.tabIndex = action.payload.tabIndex
		},
	},
	extraReducers: (builder) => {
		builder
			.addCase(getPalpitesAsync.fulfilled, (state, action) => {
				state.grupos = action.payload
			})
			.addCase(updatePalpitesAsync.fulfilled, (state, action) => {
				state.grupos = action.payload
			})
	},
})

const updateGrupos = (palpite: PalpiteType, grupos?: GrupoType[]) => {
	if (!grupos) return undefined
	const newGroups: GrupoType[] = []
	for (let i = 0; i < grupos.length; i++) {
		newGroups[i] = { nome: grupos[i].nome, rodadas: [] }
		for (let j = 0; j < grupos[i].rodadas.length; j++) {
			newGroups[i].rodadas[j] = { nome: grupos[i].rodadas[j].nome, bets: [] }
			for (let k = 0; k < grupos[i].rodadas[j].bets.length; k++) {
				newGroups[i].rodadas[j].bets[k] = { ...grupos[i].rodadas[j].bets[k] }
				if (grupos[i].rodadas[j].bets[k]._id === palpite._id) {
					newGroups[i].rodadas[j].bets[k] = { ...palpite }
				}
			}
		}
	}
	return newGroups
}

export const { selectPalpiteById, handle, handleGrupos } = palpiteSlice.actions

export const selectPalpites = (state: RootState) => state.palpite.palpites
export const selectPalpite = (state: RootState) => state.palpite.palpite
export const selectGrupos = (state: RootState) => state.palpite.grupos
export const selectTabIndex = (state: RootState) => state.palpite.tabIndex

export default palpiteSlice.reducer
