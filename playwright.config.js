import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests/e2e',
  timeout: 180000,
  workers: 1,
  fullyParallel: false,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://127.0.0.1:5179',
    headless: true,
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
    launchOptions: process.env.QA_BROWSER_PATH
      ? { executablePath: process.env.QA_BROWSER_PATH }
      : {},
  },
  webServer: [
    {
      command: 'node portfolio_backend/src/scripts/qa-server.js',
      url: 'http://127.0.0.1:5101/health',
      reuseExistingServer: !process.env.CI,
      timeout: 120000,
    },
    {
      command:
        'npm --prefix portfolio_frontend run dev -- --host 127.0.0.1 --port 5179 --strictPort',
      url: 'http://127.0.0.1:5179',
      reuseExistingServer: !process.env.CI,
      env: { VITE_API_URL: '/api', VITE_PROXY_TARGET: 'http://127.0.0.1:5101' },
    },
  ],
});
