import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

import { RootState } from "../../app/store";
import authFetch from "../../app/util/fetch";
import { backendURI } from "../../app/config/config";

const URL = `${backendURI}/api/time`;

export type HandleChangeType = {
    name: '_id' | 'nome' | 'sigla' | 'bandeira',
    value: any;
};

export type TimeType = {
  _id?: string,
  nome?: string;
  sigla?: string;
  bandeira?: string;
};

export interface TimeState {
  times: TimeType[];
  time: TimeType;
}

const initialState: TimeState = {
  times: [],
  time: {},
};

export const getTimesAsync = createAsyncThunk("time/get", async (callback?: () => void) => {
  const response = await authFetch(`${URL}`);
  callback && callback()
  return response.data;
});

export const createTimeAsync = createAsyncThunk("time/create", async (params: { time: TimeType, callback?: () => void }) => {
  const response = await authFetch(`${URL}`, { method: 'POST', body: JSON.stringify({
    nome: params.time.nome,
    sigla: params.time.sigla,
    bandeira: params.time.bandeira
  }) })
  params.callback && params.callback()
  return response.data;
});

export const updateTimeAsync = createAsyncThunk("time/update", async (params: { time: TimeType, callback?: () => void }) => {
  const response = await authFetch(`${URL}/${params.time._id}`, { method: 'PUT', body: JSON.stringify({
    nome: params.time.nome,
    sigla: params.time.sigla,
    bandeira: params.time.bandeira
  })})
  params.callback && params.callback()
  return response.data;
});

export const deleteTimeAsync = createAsyncThunk("time/delete", async (params: { time: TimeType, callback?: () => void }, { dispatch }) => {
  const response = await authFetch(`${URL}/${params.time._id}`, { method: 'DELETE' })
  dispatch(getTimesAsync(params.callback))
  return response.data;
});

export const timeSlice = createSlice({
  name: "time",
  initialState,
  reducers: {
    select: (state, action: PayloadAction<TimeType>) => {
      state.time = state.times.find(time => time._id === action.payload._id) || initialState.time
    },
    create: (state) => {
      state.time = {}
    },
    handle: (state, action: PayloadAction<HandleChangeType>) => {
      state.time = { ...state.time, [action.payload.name]: action.payload.value }
    },
    reset: (state) => {
        state.time = initialState.time
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(getTimesAsync.pending, (state) => {
        state.times = initialState.times
      })
      .addCase(getTimesAsync.fulfilled, (state, action) => {
        state.times = action.payload;
      })
      .addCase(createTimeAsync.fulfilled, (state, action) => {
        state.time = action.payload;
      })

      .addCase(updateTimeAsync.fulfilled, (state, action) => {
        state.time = action.payload;
      })
      .addCase(deleteTimeAsync.fulfilled, (state, action: PayloadAction<TimeType>) => {
        state.time = initialState.time
      })
  },
});

export const { select, handle, reset, create } = timeSlice.actions;

export const selectTimes = (state: RootState) => state.time.times;
export const selectTime = (state: RootState) => state.time.time;

export default timeSlice.reducer;