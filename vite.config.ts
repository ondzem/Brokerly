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
    // Tooling rewrites files in these folders on its own (graphify rebuilds
    // graph.html after every commit, design-sync writes preview .html, ruflo
    // keeps its state here). Vite reloads the whole page on any .html change,
    // which threw agents out of an open dialog mid-task.
    watch: {
      ignored: [
        '**/graphify-out/**',
        '**/ds-bundle/**',
        '**/.ds-sync/**',
        '**/.design-sync/**',
        '**/.claude/**',
        '**/.claude-flow/**',
        '**/.swarm/**',
        '**/supabase/**',
        '**/docs/**',
        '**/scripts/**',
        '**/dist/**',
        // Tailwind v4 skenuje každý soubor projektu, takže i změna AGENTS.md
        // (chodí přes synchronizaci od kolegy) jinak znovu načte stránku.
        '**/*.md',
        '**/*.sql',
        '**/agentdb.rvf*',
        '**/ruvector.db*',
      ],
    },
  },
});
