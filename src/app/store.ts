import { configureStore, ThunkAction, Action, Middleware, applyMiddleware } from '@reduxjs/toolkit';
import authReducer from './auth/authSlice';
import faseReducer from '../features/fase/faseSlice'
import timeReducer from '../features/time/timeSlice'
import userReducer from '../features/user/userSlice'
import partidaReducer from '../features/partida/partidaSlice'
import palpiteReducer from '../features/palpite/palpiteSlice'
import loadingReducer, { loading } from '../features/loading/loadingSlice'

const rootReducer = {
  auth: authReducer,
  fase: faseReducer,
  time: timeReducer,
  user: userReducer,
  partida: partidaReducer,
  palpite: palpiteReducer,
  loading: loadingReducer,
}

const loadingMiddleware: Middleware = storeApi => next => action => {
  const result = next(action)
  if (action.meta !== undefined) {
    if (action.meta.requestStatus === 'pending') {
      storeApi.dispatch(loading(true))
    } else if (action.meta.requestStatus === 'fulfilled') {
      storeApi.dispatch(loading(false))
    } else if (action.meta.requestStatus === 'rejected') {
      storeApi.dispatch(loading(true))
    }
  }
  return result
};

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(loadingMiddleware)
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
