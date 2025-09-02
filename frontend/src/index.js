import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import ShopContextProvider from './Context/ShopContext';
import { Auth0Provider } from '@auth0/auth0-react';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Auth0Provider
      domain="dev-pab3w45qwnjymrn1.us.auth0.com"          // e.g., your-tenant.us.auth0.com
      clientId="zaGhlUuPES39FGeERxSF7RrSV80tZp7H"     // from Auth0 dashboard
      authorizationParams={{
        redirect_uri: window.location.origin,
        scope: "openid profile email phone"  // add phone if needed
      }}
    >
      <ShopContextProvider>
        <App />
      </ShopContextProvider>
    </Auth0Provider>
  </React.StrictMode>
);

reportWebVitals();
