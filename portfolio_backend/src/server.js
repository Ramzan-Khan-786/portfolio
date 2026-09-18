import app from './app.js';
import { connectDatabase, disconnectDatabase } from './config/database.js';
import { env } from './config/env.js';
let server;
async function start() {
  await connectDatabase();
  server = app.listen(env.port, () => console.info('Portfolio API listening on port', env.port));
}
async function shutdown() {
  if (server) await new Promise((resolve) => server.close(resolve));
  await disconnectDatabase();
}
process.once('SIGINT', () => shutdown().then(() => process.exit(0)));
process.once('SIGTERM', () => shutdown().then(() => process.exit(0)));
start().catch(() => {
  console.error('Startup failed. Check the database connection and environment configuration.');
  process.exit(1);
});
