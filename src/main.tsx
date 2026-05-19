import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { GoogleOAuthProvider } from '@react-oauth/google'

import App from './App'
import { store } from './app/store'
import { googleClientId } from './app/config/config'

const container = document.getElementById('root')
if (!container) throw new Error('Root container #root not found')

// StrictMode intentionally omitted: react-router v5 + redux-toolkit v1 use legacy
// lifecycle APIs that produce noisy warnings under React 19 StrictMode.
// Will be re-enabled after F2 (Router v7) and F3 (RTK 2).
createRoot(container).render(
	<Provider store={store}>
		<GoogleOAuthProvider clientId={googleClientId}>
			<App />
		</GoogleOAuthProvider>
	</Provider>,
)
