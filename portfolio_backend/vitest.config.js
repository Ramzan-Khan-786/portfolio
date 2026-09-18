import { defineConfig } from 'vitest/config';
export default defineConfig({
  test: {
    environment: 'node',
    pool: 'threads',
    maxWorkers: 1,
    env: {
      NODE_ENV: 'test',
      MONGODB_URI: '',
      JWT_SECRET: 'isolated-test-secret-not-for-deployment',
      COOKIE_SECURE: 'false',
      COOKIE_SAME_SITE: 'lax',
      CLIENT_ORIGIN: 'http://localhost:5173',
    },
  },
});
