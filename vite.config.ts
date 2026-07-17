import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist', // Garante que o Vite coloque os arquivos do front-end aqui
    emptyOutDir: false // Importante: mantém o que o 'tsc' (servidor) já criou na pasta
  }
})
