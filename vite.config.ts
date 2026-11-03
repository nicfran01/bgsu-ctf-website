import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';
import { contentPlugin } from './scripts/vite-content-plugin.ts';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    // GitHub Pages serves the site from /<repo>/, Vercel from /. The deploy
    // workflow sets VITE_BASE; everything else gets the default.
    base: env.VITE_BASE || '/',
    plugins: [react(), contentPlugin()],
  };
});
