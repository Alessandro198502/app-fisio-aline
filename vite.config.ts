import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      external: [
        'fsevents',
        'node:fs',
        'node:path',
        'node:url',
        'fs',
        'path',
        'url'
      ]
    }
  }
})
