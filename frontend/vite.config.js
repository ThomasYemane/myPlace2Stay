// vite.config.js
import { defineConfig, loadEnv} from 'vite';
import react from '@vitejs/plugin-react';
import eslint from 'vite-plugin-eslint';

export default defineConfig(({ mode }) => {

  const env = loadEnv(mode, process.cwd(), '');

   return {
        plugins: [
          react(),
          eslint({
            lintOnStart: true,
            failOnError: mode === "production"
          })
        ],
        server: {
          proxy: {
            '/api':{
              target: env.VITE_BACKEND_API_URL
            }
          },
        }
      }
});
