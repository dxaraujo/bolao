import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { GoogleOAuthProvider } from '@react-oauth/google'

import App from './App'
import { store } from './app/store'
import { googleClientId } from './app/config/config'

import './index.css'

const container = document.getElementById('root')
if (!container) throw new Error('Root container #root not found')

// StrictMode intentionally omitted: CoreUI v2 + reactstrap use legacy lifecycle
// APIs that produce noisy warnings under React 19 StrictMode.
// Will be re-enabled once those libs are removed in the F6+ UI rewrite.
createRoot(container).render(
	<Provider store={store}>
		<GoogleOAuthProvider clientId={googleClientId}>
			<App />
		</GoogleOAuthProvider>
	</Provider>,
)
