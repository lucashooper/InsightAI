import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  root: '.',
  base: './', // Use relative paths so it works when served from /marketing-dist/
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  server: {
    port: 3001,
    open: true,
  },
});
