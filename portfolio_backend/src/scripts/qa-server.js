// Test-only server: always uses an ephemeral database, never a configured MongoDB URI.
process.env.NODE_ENV = 'test';
process.env.CLIENT_ORIGIN = 'http://127.0.0.1:5179';
process.env.JWT_SECRET = 'isolated-browser-test-secret-not-for-production';
process.env.COOKIE_SECURE = 'false';
process.env.COOKIE_SAME_SITE = 'lax';
const { MongoMemoryServer } = await import('mongodb-memory-server');
const { default: mongoose } = await import('mongoose');
const { default: bcrypt } = await import('bcryptjs');
const { default: express } = await import('express');
const { default: app } = await import('../app.js');
const { default: User } = await import('../models/User.js');
const { default: SocialLink } = await import('../models/SocialLink.js');
const { default: Setting } = await import('../models/Setting.js');
const { seedContent } = await import('../services/seedContent.js');
const mongo = await MongoMemoryServer.create({ instance: { launchTimeout: 60000 } });
await mongoose.connect(mongo.getUri());
await User.create({
  email: 'qa@example.test',
  name: 'QA administrator',
  passwordHash: await bcrypt.hash('qa-fixture-password-123', 4),
});
await seedContent({ typewriterUrl: 'http://127.0.0.1:5191' });
await SocialLink.create({
  label: 'GitHub',
  kind: 'github',
  url: 'https://github.com',
  enabled: true,
});
await Setting.create({ key: 'contactEmail', value: 'qa@example.test' });
const fixture = express();
fixture.get('/', (_req, res) =>
  res.send(
    `<!doctype html><html lang="en"><head><meta name="viewport" content="width=device-width, initial-scale=1"><title>Independent embed test fixture</title><style>body{font-family:system-ui;background:#fafaf8;color:#213127;padding:24px;box-sizing:border-box;margin:0}h1{font-size:24px}textarea{width:100%;box-sizing:border-box;min-height:180px;padding:12px;font:16px system-ui}p{line-height:1.6}</style></head><body><p>Integration test fixture</p><h1>Independent application</h1><p>This controlled test page verifies iframe interaction. It is not the TypeWriter product.</p><label for="draft">Test text</label><textarea id="draft"></textarea><p id="count">0 characters</p><script>document.getElementById('draft').addEventListener('input',function(){document.getElementById('count').textContent=this.value.length+' characters'});parent.postMessage({type:'portfolio:ready'},'http://127.0.0.1:5179');</script></body></html>`,
  ),
);
const fixtureServer = fixture.listen(5191, '127.0.0.1');
const apiServer = app.listen(5101, '127.0.0.1', () =>
  console.info('Isolated QA API ready on 5101; embed fixture on 5191.'),
);
async function stop() {
  await Promise.all([
    new Promise((resolve) => apiServer.close(resolve)),
    new Promise((resolve) => fixtureServer.close(resolve)),
  ]);
  await mongoose.disconnect();
  await mongo.stop();
  process.exit(0);
}
process.on('SIGINT', stop);
process.on('SIGTERM', stop);
