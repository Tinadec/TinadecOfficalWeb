import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import path from 'node:path'

export default defineConfig({
  // BASE_PATH lets one build target either a domain root ("/") or a GitHub
  // Pages project subpath ("/TinadecOfficalWeb/"). Defaults to the root so a
  // local build keeps behaving exactly as before.
  base: process.env.BASE_PATH || '/',
  plugins: [vue(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5190,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/three')) return 'three'
        },
      },
    },
  },
})
