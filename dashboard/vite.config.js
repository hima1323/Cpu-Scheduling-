import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5180,
    strictPort: true,
    proxy: {
      '/run':           'http://localhost:8080',
      '/arena':         'http://localhost:8080',
      '/generate':      'http://localhost:8080',
      '/sweep_quantum': 'http://localhost:8080',
      '/health':        'http://localhost:8080',
    },
  },
})
