import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import axios from 'axios'

// Set axios base URL for API calls
// Ensure there is no trailing slash to avoid double-slashes when adding /api paths
// Sanitize value: remove leading/trailing slashes so it won't be treated as a relative path
let apiBase = (import.meta.env.VITE_API_URL || '').trim().replace(/^\/+|\/+$/g, '');
// If a host is set without protocol (e.g., document-tracking-backend.vercel.app),
// add https:// to ensure axios treats it as an absolute host rather than a relative path.
if (apiBase && !apiBase.startsWith('http://') && !apiBase.startsWith('https://')) {
  apiBase = 'https://' + apiBase;
}
// If a base is set (production/staging backend), make sure it calls the API path
if (apiBase) {
  // Do not duplicate /api prefix
  if (!/\/api($|\/)/.test(apiBase)) {
    apiBase = apiBase.replace(/\/$/, '');
  }
} else {
  // In development, use /api as the base so Vite can proxy requests to the backend
  apiBase = import.meta.env.DEV ? '' : '';
}

axios.defaults.baseURL = apiBase;

// Log the base URL during development to assist debugging on staging/production
if (import.meta.env.DEV) {
  console.log('API baseURL:', axios.defaults.baseURL);
  if (apiBase && !apiBase.startsWith('http')) {
    console.warn('VITE_API_URL does not include protocol; prefixed with https:// by client');
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
