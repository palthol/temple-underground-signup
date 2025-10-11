import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // Allow calling the API without setting VITE_API_URL during dev
      '/api': 'http://localhost:3001',
      '/health': 'http://localhost:3001'
    }
  }
});
