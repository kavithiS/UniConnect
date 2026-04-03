import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { detectBackendBaseUrl } from './utils/backendUrl'

// Bootstrap: detect backend and start app
async function bootstrap() {
  // If a VITE_BACKEND_URL is provided, honor it and set localStorage so
  // detection uses the pinned backend and we avoid stale cached ports.
  try {
    const envUrl = import.meta?.env?.VITE_BACKEND_URL;
    if (envUrl && typeof window !== 'undefined') {
      const normalized = envUrl.replace(/\/+$/, '');
      localStorage.setItem('backendBaseUrl', normalized);
      // eslint-disable-next-line no-console
      console.log(`📌 Using VITE_BACKEND_URL=${normalized}`);
    }
  } catch (e) {
    // ignore
  }
  try {
    await detectBackendBaseUrl();
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('detectBackendBaseUrl error', err);
  }

  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}

bootstrap();
