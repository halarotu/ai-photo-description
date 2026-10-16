import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ command, mode, isPreview }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const isDevServer = command === 'serve' && !isPreview
  if (isDevServer && !env.API_URL) {
    throw new Error('API_URL is not set (see .env.development)')
  }

  return {
    plugins: [react()],
    server: {
      // Forward API calls to the backend so the browser sees a single origin
      proxy: env.API_URL ? { '/get-description': env.API_URL } : undefined,
    },
  }
})
