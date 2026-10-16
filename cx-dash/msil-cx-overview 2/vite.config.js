import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// During local dev, every request to /api is forwarded to your backend.
// Set VITE_PROXY_TARGET in .env.local (default: http://localhost:8000).
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target: env.VITE_PROXY_TARGET || 'http://localhost:8000',
          changeOrigin: true,
        },
      },
    },
  };
});
