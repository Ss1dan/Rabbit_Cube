import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/global.css';
import App from './App';
import { Provider } from 'react-redux';
import { store } from './store';
import { GoogleOAuthProvider } from '@react-oauth/google';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <GoogleOAuthProvider clientId="1036477822353-67h2epjl8npqlmqpt5pa4lvc6kepaamf.apps.googleusercontent.com">
    <Provider store={store}>
      <App />
    </Provider>
  </GoogleOAuthProvider>
);