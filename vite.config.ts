import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // In development, forward /api/... to the FastAPI backend.
    // The browser thinks it is talking to localhost:5173, so CORS is not involved.
    proxy: { '/api': 'http://localhost:8080' },
  },
})
