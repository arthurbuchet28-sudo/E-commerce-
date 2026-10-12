/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
  build: {
    // Les drapeaux restent des fichiers séparés (chargés à l'affichage) au lieu d'être intégrés au code.
    assetsInlineLimit: (fichier) => (fichier.includes('flag-icons') ? false : undefined),
  },
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.ts'],
  },
});
