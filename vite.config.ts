import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Tauri expects a fixed port in dev
  server: {
    port: 1420,
    strictPort: true,
    // Tauri dev server host check
    host: '0.0.0.0',
    hmr: {
      protocol: 'ws',
      host: '127.0.0.1',
      port: 1421,
    },
  },
  // prevent vite from obscuring rust errors
  clearScreen: false,
})
