import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

import { RootState } from "../../app/store";
import authFetch from "../../app/util/fetch";
import { backendURI } from "../../app/config/config";
import { PalpiteType } from "../palpite/palpiteSlice";

const URL = `${backendURI}/api/user`;

export type HandleChangeType = {
  name: 'isAdmin' | 'ativo',
  value: boolean;
};

export type UserType = {
  _id?: string,
	name?: string,
	email?: string,
	picture?: string,
	placarCheio?: number,
	placarTimeVencedorComGol?: number,
	placarTimeVencedor?: number,
	placarGol?: number,
	totalAcumulado?: number,
	classificacao?: number,
	classificacaoAnterior?: number,
	isAdmin?: boolean,
	ativo?: boolean,
  palpites?: PalpiteType[]
};

export interface UserState {
  users: UserType[];
  user: UserType;
}

const initialState: UserState = {
  users: [],
  user: {},
};

export const getUsersAsync = createAsyncThunk("user/get", async (callback?: () => void) => {
  const response = await authFetch(`${URL}`);
  callback && callback()
  return response.data;
});

export const updateUserAsync = createAsyncThunk("user/update", async (params: { user: UserType, callback?: () => void}) => {
  const response = await authFetch(`${URL}/${params.user._id}`, { method: 'PUT', body: JSON.stringify({
    ativo: params.user.ativo,
    isAdmin: params.user.isAdmin,
  }) })
  params.callback && params.callback()
  return response.data;
});

export const deleteUserAsync = createAsyncThunk("user/delete", async (params: { user: UserType, callback?: () => void}, { dispatch }) => {
  const response = await authFetch(`${URL}/${params.user._id}`, { method: 'DELETE' })
  dispatch(getUsersAsync(params.callback))
  return response.data
});

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    select: (state, action: PayloadAction<UserType>) => {
      state.user = state.users.find(user => user._id === action.payload._id) || initialState.user
    },
    handle: (state, action: PayloadAction<HandleChangeType>) => {
      state.user = { ...state.user, [action.payload.name]: action.payload.value }
    },
    reset: (state) => {
      state.user = initialState.user
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(getUsersAsync.pending, (state) => {
        state.users = initialState.users
      })
      .addCase(getUsersAsync.fulfilled, (state, action) => {
        state.users = action.payload;
      })
      .addCase(updateUserAsync.fulfilled, (state, action) => {
        state.user = action.payload;
      })
      .addCase(deleteUserAsync.fulfilled, (state, action) => {
        state.user = initialState.user
      })
  },
});

export const { select, handle, reset } = userSlice.actions;

export const selectUsers = (state: RootState) => state.user.users;
export const selectUser = (state: RootState) => state.user.user;

export default userSlice.reducer;