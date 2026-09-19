import app from './app.js';
import { connectDatabase, disconnectDatabase } from './config/database.js';
import { env } from './config/env.js';
import { audit, logger } from './services/logger.js';
let server,
  stopping = false;
async function shutdown(code = 0) {
  if (stopping) return;
  stopping = true;
  const timer = setTimeout(() => process.exit(1), 10000);
  timer.unref();
  if (server) await new Promise((resolve) => server.close(resolve));
  await disconnectDatabase();
  audit('application', 'application.stopped');
  logger.on('finish', () => {
    clearTimeout(timer);
    process.exit(code);
  });
  logger.end();
}
async function start() {
  await connectDatabase();
  server = app.listen(env.port, () => {
    audit('application', 'application.started', { port: env.port });
    console.info('Portfolio API listening on port', env.port);
  });
  server.on('error', () => {
    audit('error', 'application.failed', { code: 'listen_failed' });
    shutdown(1);
  });
}
process.once('SIGINT', () => shutdown());
process.once('SIGTERM', () => shutdown());
process.once('uncaughtException', () => {
  audit('error', 'application.failed', { code: 'uncaught_exception' });
  shutdown(1);
});
process.once('unhandledRejection', () => {
  audit('error', 'application.failed', { code: 'unhandled_rejection' });
  shutdown(1);
});
start().catch(() => {
  audit('error', 'application.failed', { code: 'startup_failed' });
  console.error('Startup failed. Check the database connection and environment configuration.');
  shutdown(1);
});
