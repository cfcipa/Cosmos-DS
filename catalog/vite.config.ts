import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

// Sitio del catálogo (npm run dev). La librería se compila con el vite.config.ts de la raíz.
export default defineConfig({
  root: fileURLToPath(new URL('.', import.meta.url)),
  base: './',
  plugins: [react()],
  server: { port: 5173, open: true },
  build: { outDir: '../catalog-dist', emptyOutDir: true },
});
