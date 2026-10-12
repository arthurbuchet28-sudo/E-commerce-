/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  base: './',
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      // SANS_PWA=1 : build sans service worker (hébergements qui ne les autorisent pas).
      disable: process.env.SANS_PWA === '1',
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icones/apple-touch-icon.png'],
      manifest: {
        name: 'QuizMania',
        short_name: 'QuizMania',
        description: 'Des quiz en français, fun, animés et rejouables à l’infini.',
        lang: 'fr',
        dir: 'ltr',
        start_url: './',
        scope: './',
        display: 'standalone',
        orientation: 'portrait',
        theme_color: '#4c1d95',
        background_color: '#f5f3ff',
        categories: ['games', 'education', 'entertainment'],
        icons: [
          { src: 'icones/icone-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icones/icone-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icones/icone-masquable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // Application, banque locale, drapeaux et sons : tout est disponible hors ligne.
        globPatterns: ['**/*.{js,css,html,svg,png,wav,woff2}'],
        navigateFallback: 'index.html',
        cleanupOutdatedCaches: true,
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.origin === 'https://fonts.googleapis.com' || url.origin === 'https://fonts.gstatic.com',
            handler: 'CacheFirst',
            options: { cacheName: 'polices', expiration: { maxEntries: 20, maxAgeSeconds: 365 * 24 * 3600 }, cacheableResponse: { statuses: [0, 200] } },
          },
          {
            // Photos Wikimedia Commons déjà vues : rejouables hors ligne.
            urlPattern: ({ url }) => /(^|\.)wikimedia\.org$/.test(url.hostname) && (url.pathname.includes('/thumb/') || url.pathname.includes('Special:FilePath')),
            handler: 'CacheFirst',
            options: { cacheName: 'photos-commons', expiration: { maxEntries: 400, maxAgeSeconds: 60 * 24 * 3600 }, cacheableResponse: { statuses: [0, 200] } },
          },
          // Les extraits Deezer expirent au bout de 15 minutes : jamais mis en cache.
        ],
      },
    }),
  ],
  build: {
    // Les drapeaux restent des fichiers séparés (chargés à l'affichage) au lieu d'être intégrés au code.
    assetsInlineLimit: (fichier) => (fichier.includes('flag-icons') ? false : undefined),
    rolldownOptions: {
      output: {
        // Bibliothèques et banque locale dans des fichiers à part : mieux mis en cache d'une version à l'autre.
        codeSplitting: {
          groups: [
            { name: 'react', test: /node_modules[\\/](react|react-dom|react-router|react-router-dom|scheduler)[\\/]/ },
            { name: 'animations', test: /node_modules[\\/](framer-motion|motion-dom|motion-utils|canvas-confetti)[\\/]/ },
            { name: 'banque', test: /src[\\/]data[\\/]questions[\\/]/ },
          ],
        },
      },
    },
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
