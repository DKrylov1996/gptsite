import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react()],
    server: {
      port: Number(env.VITE_DEV_SERVER_PORT || 5173),
      host: true,
      hmr: {
        host: '192.168.1.105',  // ← ВАШ IP
        port: 5173
      },
      cors: true,  // ← Разрешить CORS
      proxy: {     // ← Прокси для API
        '/api': {
          target: 'http://192.168.1.105:4000',  // ← ВАШ IP
          changeOrigin: true,
          secure: false
        }
      }
    }
  }
})
