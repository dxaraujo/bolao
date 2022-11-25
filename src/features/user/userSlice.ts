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
  loadding: boolean;
}

const initialState: UserState = {
  users: [],
  user: {},
  loadding: false
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
        state.loadding = true;
        state.users = initialState.users
      })
      .addCase(getUsersAsync.fulfilled, (state, action) => {
        state.loadding = false;
        state.users = action.payload;
      })
      .addCase(getUsersAsync.rejected, (state) => {
        state.loadding = false;
      })
      .addCase(updateUserAsync.pending, (state) => {
        state.loadding = true;
      })
      .addCase(updateUserAsync.fulfilled, (state, action) => {
        state.loadding = false;
        state.user = action.payload;
      })
      .addCase(updateUserAsync.rejected, (state) => {
        state.loadding = false;
      })
      .addCase(deleteUserAsync.pending, (state) => {
        state.loadding = true;
      })
      .addCase(deleteUserAsync.fulfilled, (state, action) => {
        state.loadding = false;
        state.user = initialState.user
      })
      .addCase(deleteUserAsync.rejected, (state) => {
        state.loadding = false;
      });
  },
});

export const { select, handle, reset } = userSlice.actions;

export const selectUsers = (state: RootState) => state.user.users;
export const selectUser = (state: RootState) => state.user.user;
export const selectUsersLoadding = (state: RootState) => state.user.loadding;

export default userSlice.reducer;