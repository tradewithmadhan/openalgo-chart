import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'https://flattrade.captanvizhuthugal.top',
        changeOrigin: true,
      },
      '/ws': {
        target: 'wss://flattrade.captanvizhuthugal.top/ws',
        ws: true,
      },
      '/npl-time': {
        target: 'https://www.nplindia.in',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/npl-time/, '/cgi-bin/ntp_client'),
        secure: true,
      }
    }
  }
})