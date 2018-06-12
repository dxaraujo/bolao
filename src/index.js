import React from 'react'
import ReactDOM from 'react-dom'

import { applyMiddleware, combineReducers, createStore } from 'redux'
import { Provider } from 'react-redux'

import multi from 'redux-multi'
import promise from 'redux-promise'
import thunk from 'redux-thunk'

import App from './App'
import { timeReducer, partidaReducer, palpiteReducer, userReducer, faseReducer } from './reducers';
import registerServiceWorker from './registerServiceWorker';

const reducers = combineReducers({
	timeStore: timeReducer,
	partidaStore: partidaReducer,
	palpiteStore: palpiteReducer,
	userStore: userReducer,
	faseStore: faseReducer
});

const devTools = window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
const store = applyMiddleware(multi, thunk, promise)(createStore)(reducers, devTools)

ReactDOM.render(
	<Provider store={store}>
		<App />
	</Provider>
, document.getElementById('root'))
registerServiceWorker();