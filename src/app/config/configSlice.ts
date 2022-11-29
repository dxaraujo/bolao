import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

import authFetch from "../../app/util/fetch";
import { RootState } from "../../app/store";
import { backendURI } from "../../app/config/config";

const URL = `${backendURI}/api/config`;

type ConfigPayloadAction = {
    atualizandoPontuacoes: boolean;  
}

export interface ConfigState {
  atualizandoPontuacoes: boolean;
}

const initialState: ConfigState = {
  atualizandoPontuacoes: false
};

export const getConfigsAsync = createAsyncThunk("config/get", async () => {
    const response = await authFetch(`${URL}`);
    return response.data;
});

export const configSlice = createSlice({
  name: "config",
  initialState,
  reducers: {
  },
  extraReducers: (builder) => {
    builder.addCase(getConfigsAsync.fulfilled, (state, action: PayloadAction<ConfigPayloadAction[]>) => {
        if (action.payload && action.payload.length && action.payload.length > 0) {
            state.atualizandoPontuacoes = action.payload[0].atualizandoPontuacoes
        }
    })
  },
});

export const selectAtualizandoPontuacoes = (state: RootState) => state.config.atualizandoPontuacoes;

export default configSlice.reducer;