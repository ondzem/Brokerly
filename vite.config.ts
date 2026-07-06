import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
  envPrefix: 'NEXT_PUBLIC_',
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/api-scraper': {
        target: 'https://api.scraperapi.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api-scraper/, ''),
        headers: {
          'Cookie': 'sznconsent=1',
          'Sna-Cookie': 'sznconsent=1'
        }
      },
    },
  },
});
