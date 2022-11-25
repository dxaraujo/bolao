import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

import { RootState } from "../../app/store";
import authFetch from "../util/fetch";
import { backendURI } from "../config/config";
import { UserType } from "../../features/user/userSlice";

const URL = `${backendURI}/api/user`;

export interface AuthUserState {
  authUser: UserType | undefined;
  loadding: boolean;
}

const initialState: AuthUserState = {
  authUser: undefined,
  loadding: false
};

export const getAuthUserAsync = createAsyncThunk("authUser/get", async () => {
  const response = await authFetch(`${URL}/authenticated`);
  return response.data;
});

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAuthUserAsync.pending, (state) => {
        state.loadding = true;
      })
      .addCase(getAuthUserAsync.fulfilled, (state, action: PayloadAction<UserType>) => {
        state.loadding = false;
        state.authUser = action.payload;
      })
      .addCase(getAuthUserAsync.rejected, (state) => {
        state.loadding = false;
      });
  },
});

export const { } = authSlice.actions;

export const selectAuthUser = (state: RootState) => state.auth.authUser;
export const selectAuthUserLoadding = (state: RootState) => state.auth.loadding;

export default authSlice.reducer;