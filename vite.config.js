import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/agents': 'http://127.0.0.1:8000',
      '/policies': 'http://127.0.0.1:8000',
      '/event-history': 'http://127.0.0.1:8000',
      '/tenants': 'http://127.0.0.1:8000',
      '/sync': 'http://127.0.0.1:8000', 
    }
  }
})