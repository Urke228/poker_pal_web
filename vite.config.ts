import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Pinned so the dev origin is predictable: the API only sends CORS headers
    // to an allowlisted origin, and Vite silently picking the next free port
    // would put the app on one the API does not recognise.
    port: 5173,
    strictPort: true,
  },
})
