import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
export default defineConfig(({ command }) => ({
  plugins: [react()],
  base: command === 'serve' ? '/' : '/personal-website-react/',
  build: {
    outDir: 'dist',
    emptyOutDir: true
  },
  server: {
    port: 5173,
    open: true
  }
}))
