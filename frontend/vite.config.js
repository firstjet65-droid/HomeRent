import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const backendHost = process.env.VITE_BACKEND_HOST || '127.0.0.1'
const backendPort = Number(process.env.VITE_BACKEND_PORT || 6000)
const backendTarget = process.env.VITE_BACKEND_TARGET || `http://${backendHost}:${backendPort}`
const frontendPort = Number(process.env.VITE_PORT || 5185)

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: '127.0.0.1',
    port: frontendPort,
    strictPort: true,
    proxy: {
      '/api': {
        target: backendTarget,
        changeOrigin: true,
      },
      '/uploads': {
        target: backendTarget,
        changeOrigin: true,
      },
    },
  },
})
