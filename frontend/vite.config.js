import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "/vote-app",  // Ensure this is the correct base path for the app
  server: {
    proxy: {
      '/api': 'http://localhost:3001', // Proxy requests starting with '/api' to your backend
    }
  }
})
