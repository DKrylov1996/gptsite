import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react()],
    server: {
      port: Number(env.VITE_DEV_SERVER_PORT || 5173),
      host: true,
      allowedHosts: [  // ← ДОБАВИТЬ ЭТО
        'topoftheyear.ru',
        '.topoftheyear.ru',  // поддомены
        'localhost',
        '192.168.1.105'
      ],
      hmr: {
        host: '192.168.1.105',
        port: 5173
      },
      cors: true,
      proxy: {
        '/api': {
          target: 'http://192.168.1.105:4000',
          changeOrigin: true,
          secure: false
        }
      }
    }
  }
})