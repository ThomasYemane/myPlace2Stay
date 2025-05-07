import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import App from './App';
import './index.css';
import configureStore from './store';
import * as sessionActions from './store/session';
import { restoreCSRF, csrfFetch } from './store/csrf'; // ✅ Add this line
import { signup } from './store/session';


const store = configureStore();

if (import.meta.env.MODE !== 'production') {
  restoreCSRF(); // ✅ Moved above render is fine too

  window.csrfFetch = csrfFetch;
  window.store = store;
  window.signup = signup;
  window.sessionActions = sessionActions;
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);
