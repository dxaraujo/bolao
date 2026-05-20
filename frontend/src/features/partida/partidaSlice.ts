import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

import { RootState } from "../../app/store";
import authFetch from "../../app/util/fetch";
import { backendURI } from "../../app/config/config";
import { TimeType } from "../time/timeSlice";

const URL = `${backendURI}/api/partida`;

export type HandleChangeType = {
  name: 'order' | 'fase' | 'grupo' | 'rodada' | 'data' | 'timeA' | 'placarTimeA' | 'timeB' | 'placarTimeB',
  value: any;
};

export type ResultadoHandleChangeType = {
  partida: PartidaType,
  handle: {
    name: 'placarTimeA' | 'placarTimeB',
    value: number;
  };
};

export type PartidaType = {
  _id?: string,
	order?: number,
	fase?: 'FASE DE GRUPOS' | 'OITAVAS DE FINAL' | 'QUARTAS DE FINAL' | 'SEMIFINAL' | 'DISPUTA DO 3º LUGAR' | 'FINAL',
	grupo?: 'GRUPO A' | 'GRUPO B' | 'GRUPO C' | 'GRUPO D' | 'GRUPO E' | 'GRUPO F' | 'GRUPO G' | 'GRUPO H' | 'SEM GRUPO',
	rodada?: '1ª RODADA' | '2ª RODADA' | '3ª RODADA' | 'SEM RODADA'
	data?: Date,
	timeA?: TimeType,
	placarTimeA?: number,
	timeB?: TimeType,
	placarTimeB?: number
};

export interface PartidaState {
  partidas: PartidaType[];
  partida: PartidaType;
}

const initialState: PartidaState = {
  partidas: [],
  partida: {},
};

export const getPartidasAsync = createAsyncThunk("partida/get", async (callback?: () => void) => {
  const response = await authFetch(`${URL}`);
  callback && callback()
  return response.data;
});

export const getResultadosAsync = createAsyncThunk("partida/getResultado", async (callback?: () => void) => {
  const response = await authFetch(`${URL}/resultado`);
  callback && callback()
  return response.data;
});

export const createPartidaAsync = createAsyncThunk("partida/create", async (params: { partida: PartidaType, callback?: () => void }) => {
  const response = await authFetch(`${URL}`, { method: 'POST', body: JSON.stringify({
    order: params.partida.order,
    fase: params.partida.fase,
    grupo: params.partida.grupo,
    rodada: params.partida.rodada,
    data: params.partida.data,
    timeA: params.partida.timeA,
    placarTimeA: params.partida.placarTimeA,
    timeB: params.partida.timeB,
    placarTimeB: params.partida.placarTimeB,
  }) })
  params.callback && params.callback()
  return response.data;
});

export const updatePartidaAsync = createAsyncThunk("partida/update", async (params: { partida: PartidaType, callback?: () => void }) => {
  const response = await authFetch(`${URL}/${params.partida._id}`, { method: 'PUT', body: JSON.stringify({
    order: params.partida.order,
    fase: params.partida.fase,
    grupo: params.partida.grupo,
    rodada: params.partida.rodada,
    data: params.partida.data,
    timeA: params.partida.timeA,
    placarTimeA: params.partida.placarTimeA,
    timeB: params.partida.timeB,
    placarTimeB: params.partida.placarTimeB,
  }) })
  params.callback && params.callback()
  return response.data;
});

export const updateResultadoAsync = createAsyncThunk("partida/updateResultado", async (params: { partida: PartidaType, callback?: () => void }) => {
  const response = await authFetch(`${URL}/${params.partida._id}/updateResultado`, { method: 'PUT', body: JSON.stringify({
    placarTimeA: params.partida.placarTimeA,
    placarTimeB: params.partida.placarTimeB,
  }) })
  params.callback && params.callback()
  return response.data;
});

export const deletePartidaAsync = createAsyncThunk("partida/delete", async (params: { partida: PartidaType, callback?: () => void }, { dispatch }) => {
  const response = await authFetch(`${URL}/${params.partida._id}`, { method: 'DELETE' })
  dispatch(getPartidasAsync(params.callback))
  return response.data;
});

export const partidaSlice = createSlice({
  name: "partida",
  initialState,
  reducers: {
    select: (state, action: PayloadAction<PartidaType>) => {
      state.partida = state.partidas.find(partida => partida._id === action.payload._id) || initialState.partida
    },
    create: (state) => {
      state.partida = initialState.partida
    },
    handle: (state, action: PayloadAction<HandleChangeType>) => {
      state.partida = { ...state.partida, [action.payload.name]: action.payload.value }
    },
    handleResultado: (state, action: PayloadAction<ResultadoHandleChangeType>) => {
      const index = state.partidas.findIndex(partida => partida._id === action.payload.partida._id)
      if (index >= 0) {
        state.partidas[index] = { ...state.partidas[index], [action.payload.handle.name]: action.payload.handle.value }
      }
    },
    reset: (state) => {
      state.partida = initialState.partida
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(getPartidasAsync.pending, (state) => {
        state.partidas = initialState.partidas
      })
      .addCase(getPartidasAsync.fulfilled, (state, action) => {
        state.partidas = action.payload;
      })
      .addCase(getResultadosAsync.pending, (state) => {
        state.partidas = initialState.partidas
      })
      .addCase(getResultadosAsync.fulfilled, (state, action) => {
        state.partidas = action.payload;
      })
      .addCase(createPartidaAsync.fulfilled, (state, action) => {
        state.partida = action.payload;
      })

      .addCase(updatePartidaAsync.fulfilled, (state, action) => {
        state.partida = action.payload;
      })
      .addCase(updateResultadoAsync.fulfilled, (state, action) => {
        state.partida = action.payload;
      }) 
  },
});

export const { select, create, handle, handleResultado, reset } = partidaSlice.actions;

export const selectPartidas = (state: RootState) => state.partida.partidas;
export const selectPartida = (state: RootState) => state.partida.partida;

export default partidaSlice.reducer;