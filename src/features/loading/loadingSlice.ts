import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { RootState } from "../../app/store";

export interface LoadingState {
  loading: boolean;
  loadingCount: number;
}

const initialState: LoadingState = {
  loading: false,
  loadingCount: 0
};

export const loadingSlice = createSlice({
  name: "loading",
  initialState,
  reducers: {
    loading: (state, action: PayloadAction<boolean>) => {
      if (action.payload === true) {
        state.loadingCount = state.loadingCount + 1
      } else {
        state.loadingCount = state.loadingCount - 1
      }
      if (state.loadingCount > 0 ) {
        state.loading = true
      } else {
        state.loading = false
      }
    }
  }
});

export const { loading } = loadingSlice.actions;

export const selectLoading = (state: RootState) => state.loading.loading;

export default loadingSlice.reducer;