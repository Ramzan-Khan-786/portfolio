import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import pdfAssetsPlugin from './pdfAssetsPlugin.js';
import themeBootPlugin from './themeBootPlugin.js';
export default defineConfig(({ mode }) => {
  const config = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react(), pdfAssetsPlugin(), themeBootPlugin()],
    server: { fs: { allow: ['..'] }, proxy: { '/api': config.VITE_PROXY_TARGET || 'http://localhost:5000' } },
    test: {
      environment: 'jsdom',
      setupFiles: './src/test/setup.js',
      css: true,
      pool: 'threads',
      maxWorkers: 1,
    },
  };
});
