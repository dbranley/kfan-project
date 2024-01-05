/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    proxy: {
      '/api': 'http://127.0.0.1:8000'
    },
    host: '127.0.0.1'
  },    
  plugins: [react()],
  test: {
    globals: true,
    css: false,
    environment: "jsdom",
    setupFiles: "src/setupTests.ts"
  }  
})
