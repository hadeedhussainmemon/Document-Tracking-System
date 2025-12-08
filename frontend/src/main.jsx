import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import axios from 'axios'

// Set axios base URL for API calls
// Ensure there is no trailing slash to avoid double-slashes when adding /api paths
const apiBase = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
axios.defaults.baseURL = apiBase;

// Log the base URL during development to assist debugging on staging/production
if (import.meta.env.DEV) {
  console.log('API baseURL:', axios.defaults.baseURL);
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
