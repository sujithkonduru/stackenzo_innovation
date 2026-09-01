import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// The backend has no CORS headers configured, so calling it directly from
// the Vite dev server (a different origin: localhost:5173 vs localhost:8000)
// fails with a CORS error in the browser. To avoid that, the frontend calls
// a same-origin path ("/api", see VITE_API_BASE_URL in .env) and Vite's dev
// server proxies that path to the real backend below — the browser only
// ever talks to localhost:5173, so no CORS preflight is involved.
//
// VITE_BACKEND_ORIGIN is the actual backend URL used only by this proxy
// (server-side, in Node — never sent to the browser). Set it in .env.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const backendOrigin = env.VITE_BACKEND_ORIGIN || 'http://localhost:8000';

  const proxyConfig = {
    '/api': {
      target: backendOrigin,
      changeOrigin: true,
      secure: false
    }
  };

  return {
    plugins: [react()],
    server: {
      port: 5173,
      host: true,
      proxy: proxyConfig
    },
    preview: {
      port: 4173,
      host: true,
      proxy: proxyConfig
    }
  };
});
