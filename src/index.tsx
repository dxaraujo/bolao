import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from './app/store';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { ClearCacheProvider } from 'react-clear-cache';

import App from './App';
import reportWebVitals from './reportWebVitals';
import { googleClientId } from './app/config/config'

const container = document.getElementById('root')!;
const root = createRoot(container);

root.render(
  <ClearCacheProvider auto={true} duration={3600}>
    <Provider store={store}>
      <GoogleOAuthProvider clientId={googleClientId}>
        <App />
      </GoogleOAuthProvider>
    </Provider>
  </ClearCacheProvider>
);

reportWebVitals();
