// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import eslint from 'vite-plugin-eslint';

export default defineConfig({
  plugins: [react(), eslint()],
  server: {
    proxy: {
      '/api': 'http://localhost:8000' // 🔥 must be exactly this!
    }
  }
});
