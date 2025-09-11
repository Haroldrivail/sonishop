import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
  return {
    plugins: [react()],
    server: {
      // Proxy API calls to the Laravel backend in development to avoid CORS
      proxy: {
        '/api': {
          target: 'http://localhost:8000',
          changeOrigin: true,
          secure: false,
          // do not rewrite the path, backend expects /api/... as-is
          rewrite: (path) => path,
        },
      },
    },
  }
})
