import { configureStore, type Middleware, type ThunkAction, type Action } from '@reduxjs/toolkit'

import authReducer from './auth/authSlice'
import configReducer from './config/configSlice'
import faseReducer from '../features/fase/faseSlice'
import timeReducer from '../features/time/timeSlice'
import userReducer from '../features/user/userSlice'
import partidaReducer from '../features/partida/partidaSlice'
import palpiteReducer from '../features/palpite/palpiteSlice'
import loadingReducer, { loading } from '../features/loading/loadingSlice'

const loadingMiddleware: Middleware = (storeApi) => (next) => (action) => {
	const result = next(action)
	const meta = (action as { meta?: { requestStatus?: string } }).meta
	if (meta?.requestStatus === 'pending') {
		storeApi.dispatch(loading(true))
	} else if (meta?.requestStatus === 'fulfilled') {
		storeApi.dispatch(loading(false))
	} else if (meta?.requestStatus === 'rejected') {
		storeApi.dispatch(loading(true))
	}
	return result
}

export const store = configureStore({
	reducer: {
		auth: authReducer,
		config: configReducer,
		fase: faseReducer,
		time: timeReducer,
		user: userReducer,
		partida: partidaReducer,
		palpite: palpiteReducer,
		loading: loadingReducer,
	},
	middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(loadingMiddleware),
})

export type AppDispatch = typeof store.dispatch
export type RootState = ReturnType<typeof store.getState>
export type AppThunk<ReturnType = void> = ThunkAction<
	ReturnType,
	RootState,
	unknown,
	Action<string>
>
