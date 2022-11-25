import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

import { RootState } from "../../app/store";
import authFetch from "../../app/util/fetch";
import { backendURI } from "../../app/config/config";
import { UserType } from "../user/userSlice";
import { PartidaType } from "../partida/partidaSlice";

const URL = `${backendURI}/api/palpite`;

export type HandleChangeType = {
  palpite: PalpiteType,
  handle: {
    name: 'placarTimeA' | 'placarTimeB',
    value: number;
  };
};

export type GrupoType = {
  nome: string,
  rodadas: RodadaType[]
}

export type RodadaType = {
  nome: string,
  palpites: PalpiteType[]
}

export type PalpiteType = {
  _id?: string,
  user?: UserType,
	partida?: PartidaType,
	placarTimeA?: number,
	placarTimeB?: number,
	totalPontosObitidos?: number,
	placarCheio?: number,
	placarTimeVencedorComGol?: number,
	placarTimeVencedor?: number,
	placarGol?: number,
	classificacao?: number,
	classificacaoAnterior?: number,
	totalAcumulado?: number
};

export interface PalpiteState {
  palpites: PalpiteType[] | undefined;
  palpite: PalpiteType | undefined;
  grupos: GrupoType[] | undefined;
  tabIndex: number;
  loadding: boolean;
}

const initialState: PalpiteState = {
  palpites: undefined,
  palpite: undefined,
  grupos: undefined,
  tabIndex: 0,
  loadding: false
};

const submit = async (palpite: PalpiteType, method: string) => {
	const id = palpite._id ? palpite._id : undefined
  const url = id ? `${URL}/${id}` : `${URL}`
  var palpiteCopy = Object.assign({}, palpite);
	delete palpiteCopy._id
	return await authFetch(url, { method: method, body: JSON.stringify(palpiteCopy) })
}

export const getPalpitesAsync = createAsyncThunk("palpites/montarGrupos", async (params: { userId: string, faseId: string, callback: () => void}) => {
  const response = await authFetch(`${URL}/${params.userId}/${params.faseId}/montarpalpites`)
  params.callback()
  return response.data;
});

export const updatePalpitesAsync = createAsyncThunk("palpites/update", async (params: { palpites: PalpiteType[], userId: string, faseId: string, callback: () => void}, { dispatch }) => {
	const response = await authFetch(`${URL}/${params.userId}/updatePalpites`, { method: 'PUT', body: JSON.stringify(params.palpites) })
  return response.data;
});

export const palpiteSlice = createSlice({
  name: "palpite",
  initialState,
  reducers: {
    selectPalpiteById: (state, action: PayloadAction<string>) => {
      if (state.palpites) {
        state.palpite = state.palpites.find(palpite => palpite._id === action.payload) || undefined
      }
    },
    handle: (state, action: PayloadAction<HandleChangeType>) => {
      if (state.palpites) {
        const palpite = state.palpites.find(palpite => palpite._id === action.payload.palpite._id) || undefined
        if (palpite) {
          palpite[action.payload.handle.name] = action.payload.handle.value
        }
      }
    },
    handleGrupos: (state, action: PayloadAction<{ palpite: PalpiteType, tabIndex: number }>) => {
      state.grupos = updateGrupos(action.payload.palpite, state.grupos)
      state.tabIndex = action.payload.tabIndex
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(getPalpitesAsync.pending, (state) => {
        state.loadding = true;
      })
      .addCase(getPalpitesAsync.fulfilled, (state, action) => {
        state.loadding = false;
        state.grupos = action.payload;
      })
      .addCase(getPalpitesAsync.rejected, (state) => {
        state.loadding = false;
      })
      .addCase(updatePalpitesAsync.pending, (state) => {
        state.loadding = true;
      })
      .addCase(updatePalpitesAsync.fulfilled, (state, action) => {
        state.loadding = false;
        state.grupos = action.payload;
      })
      .addCase(updatePalpitesAsync.rejected, (state) => {
        state.loadding = false;
      });
  },
});

const updateGrupos = (palpite: PalpiteType, grupos?: GrupoType[]) => {
  if (grupos) {
    let newGroups: GrupoType[] = []
    for (let i = 0; i < grupos.length; i++) {
      newGroups[i] = { nome: grupos[i].nome, rodadas: [] }
      for (let j = 0; j < grupos[i].rodadas.length; j++) {
        newGroups[i].rodadas[j] = { nome: grupos[i].rodadas[j].nome, palpites: [] }
        for (let k = 0; k < grupos[i].rodadas[j].palpites.length; k++) {
          newGroups[i].rodadas[j].palpites[k] = { ...grupos[i].rodadas[j].palpites[k] }
          if (grupos[i].rodadas[j].palpites[k]._id === palpite._id) {
            newGroups[i].rodadas[j].palpites[k] = { ...palpite }
          }
        }
      }
    }
    return newGroups
  } else {
    return undefined
  }
}

export const { selectPalpiteById, handle, handleGrupos } = palpiteSlice.actions;

export const selectPalpites = (state: RootState) => state.palpite.palpites;
export const selectPalpite = (state: RootState) => state.palpite.palpite;
export const selectGrupos = (state: RootState) => state.palpite.grupos;
export const selectTabIndex = (state: RootState) => state.palpite.tabIndex;
export const selectPalpitesLoadding = (state: RootState) => state.palpite.loadding;

export default palpiteSlice.reducer;