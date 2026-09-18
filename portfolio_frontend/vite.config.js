import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig(({ mode }) => {
  const config = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    server: { proxy: { '/api': config.VITE_PROXY_TARGET || 'http://localhost:5000' } },
    test: {
      environment: 'jsdom',
      setupFiles: './src/test/setup.js',
      css: true,
      pool: 'threads',
      maxWorkers: 1,
    },
  };
});
