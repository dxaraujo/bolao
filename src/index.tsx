import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from './app/store';
import { GoogleOAuthProvider } from '@react-oauth/google';

import App from './App';
import reportWebVitals from './reportWebVitals';
import { googleClientId } from './app/config/config'

const container = document.getElementById('root')!;
const root = createRoot(container);

root.render(
  <Provider store={store}>
    <GoogleOAuthProvider clientId={googleClientId}>
      <App />
    </GoogleOAuthProvider>
  </Provider>
);

reportWebVitals();
