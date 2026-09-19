import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { PDFDocument, PDFName } from 'pdf-lib';
import { mkdir, mkdtemp, readFile, readdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { beforeAll, beforeEach, afterAll, describe, it, expect, vi } from 'vitest';
import app from '../src/app.js';
import { env } from '../src/config/env.js';
import User from '../src/models/User.js';
import Resume from '../src/models/Resume.js';
import AuthAttempt from '../src/models/AuthAttempt.js';
import NavigationItem from '../src/models/NavigationItem.js';
import { seedContent } from '../src/services/seedContent.js';
import { cleanLog, createFileLogger } from '../src/services/logger.js';
const verify = vi.hoisted(() => vi.fn());
vi.mock('google-auth-library', () => ({
  OAuth2Client: class {
    verifyIdToken(args) {
      return verify(args);
    }
  },
}));
let mongo, adminCookie, folder;
const password = 'test-portfolio-password-123';
const call = (method, url, data, cookie = adminCookie) => {
  const client = request(app);
  return client[method](url)
    .set('Cookie', cookie || '')
    .set('X-Portfolio-Request', 'cms')
    .send(data);
};
const googleCookie = (response) =>
  response.headers['set-cookie']
    ?.map((v) => v.split(';')[0])
    .filter((v) => !v.endsWith('='))
    .join('; ') || '';
beforeAll(async () => {
  mongo = await MongoMemoryServer.create({ instance: { launchTimeout: 60000 } });
  await mongoose.connect(mongo.getUri());
  await Promise.all(Object.values(mongoose.models).map((m) => m.init()));
  const base = fileURLToPath(new URL('../../artifacts/tests/', import.meta.url));
  await mkdir(base, { recursive: true });
  folder = await mkdtemp(path.join(base, 'v1-'));
  env.uploadDir = path.join(folder, 'uploads');
}, 120000);
beforeEach(async () => {
  await Promise.all(Object.values(mongoose.models).map((m) => m.deleteMany({})));
  const user = await User.create({
    name: 'Admin',
    email: 'admin@test.dev',
    role: 'admin',
    passwordHash: await bcrypt.hash(password, 4),
  });
  adminCookie =
    'portfolio_admin=' +
    jwt.sign({ sub: user.id, version: 0 }, env.jwtSecret, {
      issuer: 'portfolio-api',
      audience: 'portfolio-admin',
      expiresIn: '1h',
    });
  env.googleClientId = 'test-client.apps.googleusercontent.com';
  verify.mockReset();
});
afterAll(async () => {
  await mongoose.disconnect();
  await mongo?.stop();
});
async function googleStart(email = 'google@test.dev', sub = 'google-subject') {
  const challenge = await call('post', '/api/auth/google/challenge', {}, '');
  const nonce = challenge.body.data.nonce;
  verify.mockResolvedValue({
    getPayload: () => ({ sub, email, email_verified: true, nonce, name: 'Google test user' }),
  });
  const result = await call(
    'post',
    '/api/auth/google',
    { credential: 'test-credential-only-not-a-real-token' },
    googleCookie(challenge),
  );
  return { result, cookie: googleCookie(result), challenge };
}
describe('normal accounts and authorization', () => {
  it('signs up without granting admin, hashes credentials, persists sessions and rejects duplicate email', async () => {
    const response = await call(
      'post',
      '/api/auth/signup',
      { name: 'A visitor', email: 'Visitor@Test.Dev', password },
      '',
    );
    expect(response.status).toBe(201);
    expect(response.body.data.user.role).toBe('user');
    const cookie = googleCookie(response),
      record = await User.findOne({ email: 'visitor@test.dev' }).select('+passwordHash');
    expect(record.passwordHash).not.toBe(password);
    expect(await bcrypt.compare(password, record.passwordHash)).toBe(true);
    expect((await call('get', '/api/auth/me', undefined, cookie)).status).toBe(200);
    expect((await call('get', '/api/admin/dashboard', undefined, cookie)).status).toBe(403);
    expect(
      (await call('post', '/api/auth/admin/login', { email: record.email, password }, '')).status,
    ).toBe(403);
    expect(
      (
        await call(
          'post',
          '/api/auth/signup',
          { name: 'Duplicate', email: record.email, password },
          '',
        )
      ).status,
    ).toBe(409);
    expect((await call('post', '/api/auth/logout', {}, cookie)).status).toBe(200);
    expect((await call('get', '/api/auth/me', undefined, cookie)).status).toBe(401);
  });
  it('rejects privilege injection and weak signup passwords', async () => {
    expect(
      (
        await call(
          'post',
          '/api/auth/signup',
          { name: 'Visitor', email: 'visitor@test.dev', password, role: 'admin' },
          '',
        )
      ).status,
    ).toBe(422);
    expect(
      (
        await call(
          'post',
          '/api/auth/signup',
          { name: 'Visitor', email: 'visitor@test.dev', password: 'short' },
          '',
        )
      ).status,
    ).toBe(422);
  });
  it('suspends only normal users and revokes their cookies', async () => {
    const created = await call(
      'post',
      '/api/auth/signup',
      { name: 'Visitor', email: 'visitor@test.dev', password },
      '',
    );
    const id = created.body.data.user.id;
    expect((await call('put', '/api/admin/users/' + id, { disabled: true })).status).toBe(200);
    expect((await call('get', '/api/auth/me', undefined, googleCookie(created))).status).toBe(401);
    expect(
      (await call('post', '/api/auth/login', { email: 'visitor@test.dev', password }, '')).status,
    ).toBe(401);
    const list = await call('get', '/api/admin/users');
    expect(JSON.stringify(list.body)).not.toMatch(/passwordHash|sessionVersion/);
    const admin = list.body.data.items.find((u) => u.role === 'admin');
    expect((await call('put', '/api/admin/users/' + admin._id, { disabled: true })).status).toBe(
      403,
    );
  });
});
describe('verified Google identities with one-use server challenges', () => {
  it('requires a portfolio password before creating a Google account and allows later email login', async () => {
    const { result, cookie } = await googleStart();
    expect(result.body.data.step).toBe('create');
    expect(await User.countDocuments({ email: 'google@test.dev' })).toBe(0);
    expect(verify).toHaveBeenCalledWith({
      idToken: 'test-credential-only-not-a-real-token',
      audience: env.googleClientId,
    });
    expect(
      (await call('post', '/api/auth/google/complete', { password: 'weakpass' }, cookie)).status,
    ).toBe(422);
    const complete = await call('post', '/api/auth/google/complete', { password }, cookie);
    expect(complete.status).toBe(201);
    expect(complete.body.data.user.providers).toEqual(['password', 'google']);
    expect((await call('post', '/api/auth/google/complete', { password }, cookie)).status).toBe(
      401,
    );
    expect(
      (await call('post', '/api/auth/login', { email: 'google@test.dev', password }, '')).status,
    ).toBe(200);
    const returning = await googleStart();
    expect(returning.result.body.data.user.email).toBe('google@test.dev');
  });
  it('does not auto-link a matching local email; requires the existing password', async () => {
    await User.create({
      name: 'Local',
      email: 'google@test.dev',
      passwordHash: await bcrypt.hash(password, 4),
    });
    const { result, cookie } = await googleStart();
    expect(result.body.data.step).toBe('link');
    expect(
      (await call('post', '/api/auth/google/complete', { password: 'wrong-password' }, cookie))
        .status,
    ).toBe(401);
    const linked = await call('post', '/api/auth/google/complete', { password }, cookie);
    expect(linked.status).toBe(200);
    expect(await User.countDocuments({ email: 'google@test.dev' })).toBe(1);
  });
  it('rejects bad token signatures, unverified email, nonce mismatch and replay', async () => {
    const challenge = await call('post', '/api/auth/google/challenge', {}, '');
    const cookie = googleCookie(challenge),
      payload = {
        sub: 'id',
        email: 'bad@test.dev',
        nonce: challenge.body.data.nonce,
        email_verified: true,
      };
    verify.mockRejectedValueOnce(new Error('bad signature'));
    expect(
      (await call('post', '/api/auth/google', { credential: 'invalid-token-value-123456' }, cookie))
        .status,
    ).toBe(401);
    verify.mockResolvedValue({ getPayload: () => ({ ...payload, email_verified: false }) });
    expect(
      (await call('post', '/api/auth/google', { credential: 'invalid-token-value-123456' }, cookie))
        .status,
    ).toBe(401);
    verify.mockResolvedValue({ getPayload: () => ({ ...payload, nonce: 'wrong' }) });
    expect(
      (await call('post', '/api/auth/google', { credential: 'invalid-token-value-123456' }, cookie))
        .status,
    ).toBe(401);
    verify.mockResolvedValue({ getPayload: () => payload });
    expect(
      (await call('post', '/api/auth/google', { credential: 'verified-token-value-12345' }, cookie))
        .status,
    ).toBe(200);
    expect(
      (await call('post', '/api/auth/google', { credential: 'verified-token-value-12345' }, cookie))
        .status,
    ).toBe(401);
  });
  it('rejects expired pending proofs and reports unconfigured Google honestly', async () => {
    const { cookie } = await googleStart();
    await AuthAttempt.updateMany({}, { expiresAt: new Date(Date.now() - 1000) });
    expect((await call('post', '/api/auth/google/complete', { password }, cookie)).status).toBe(
      401,
    );
    env.googleClientId = '';
    expect((await call('post', '/api/auth/google/challenge', {}, '')).body.data).toEqual({
      configured: false,
    });
  });
});
describe('granular CMS and resume', () => {
  it('persists structured sections and rejects unsafe links and invalid theme sets', async () => {
    const data = {
      education: [
        {
          title: 'Test course',
          organization: 'Test institution',
          period: '2026',
          description: 'Test-only content',
        },
      ],
    };
    expect((await call('put', '/api/admin/content/profile', data)).status).toBe(200);
    expect(
      (await call('get', '/api/public/bootstrap', undefined, '')).body.data.sections.profile
        .education[0].title,
    ).toBe('Test course');
    expect(
      (
        await call('put', '/api/admin/content/hero', {
          actions: [{ label: 'Unsafe', url: 'javascript:alert(1)' }],
        })
      ).status,
    ).toBe(422);
    expect((await call('put', '/api/admin/content/appearance', { enabledThemes: [] })).status).toBe(
      422,
    );
    expect(
      (
        await call('put', '/api/admin/content/appearance', {
          defaultTheme: 'light',
          enabledThemes: ['dark'],
        })
      ).status,
    ).toBe(422);
    expect((await call('get', '/api/admin/content/constructor')).status).toBe(404);
    expect((await call('put', '/api/admin/content/footer', { unexpected: true })).status).toBe(422);
  });
  it('stores real PDF bytes, exposes only the current published file and honors download settings', async () => {
    const pdf = await PDFDocument.create();
    pdf.addPage();
    const buffer = Buffer.from(await pdf.save());
    const upload = await request(app)
      .post('/api/admin/resume/file')
      .set('Cookie', adminCookie)
      .set('X-Portfolio-Request', 'cms')
      .attach('file', buffer, { filename: 'resume.pdf', contentType: 'application/pdf' });
    expect(upload.status, JSON.stringify(upload.body)).toBe(201);
    expect(upload.body.data.hasFile).toBe(true);
    expect(upload.body.data).not.toHaveProperty('filename');
    const download = await call('get', '/api/public/resume/file?download=1', undefined, '');
    expect(download.status).toBe(200);
    expect(download.headers['content-type']).toContain('application/pdf');
    expect(download.headers['content-disposition']).toContain('attachment');
    expect(download.body).toEqual(buffer);
    expect((await call('put', '/api/admin/resume', { downloadEnabled: false })).status).toBe(200);
    expect((await call('get', '/api/public/resume/file?download=1', undefined, '')).status).toBe(
      403,
    );
    expect((await call('get', '/api/public/resume/file', undefined, '')).status).toBe(200);
    await call('put', '/api/admin/resume', { visible: false });
    expect((await call('get', '/api/public/resume', undefined, '')).body.data).toEqual({
      visible: false,
    });
    expect((await call('get', '/api/public/resume/file', undefined, '')).status).toBe(404);
  });
  it('rejects fake, active and oversized PDFs and never uses an unsafe stored path', async () => {
    const upload = (buffer, name = 'resume.pdf', type = 'application/pdf') =>
      request(app)
        .post('/api/admin/resume/file')
        .set('Cookie', adminCookie)
        .set('X-Portfolio-Request', 'cms')
        .attach('file', buffer, { filename: name, contentType: type });
    expect(
      (await upload(Buffer.from('<script>bad</script>'), 'bad.html', 'text/html')).status,
    ).toBe(422);
    expect((await upload(Buffer.from('%PDF-broken'))).status).toBe(422);
    const pdf = await PDFDocument.create();
    pdf.addPage();
    pdf.catalog.set(
      PDFName.of('OpenAction'),
      pdf.context.obj({ S: 'JavaScript', JS: 'test only' }),
    );
    expect((await upload(Buffer.from(await pdf.save()))).status).toBe(422);
    expect((await upload(Buffer.alloc(5 * 1024 * 1024 + 1))).status).toBe(413);
    await Resume.create({ filename: '../../.env' });
    expect((await call('get', '/api/public/resume/file', undefined, '')).status).toBe(404);
  });
  it('detaches the current PDF without deleting stored bytes and rejects nested active objects', async () => {
    const pdf = await PDFDocument.create();
    pdf.addPage();
    const upload = await request(app)
      .post('/api/admin/resume/file')
      .set('Cookie', adminCookie)
      .set('X-Portfolio-Request', 'cms')
      .attach('file', Buffer.from(await pdf.save()), {
        filename: 'resume.pdf',
        contentType: 'application/pdf',
      });
    expect(upload.status).toBe(201);
    const before = await readdir(env.uploadDir);
    expect((await call('delete', '/api/admin/resume/file')).body.data.hasFile).toBe(false);
    expect(await readdir(env.uploadDir)).toEqual(before);
    expect((await call('get', '/api/public/resume/file', undefined, '')).status).toBe(404);
    pdf
      .getPage(0)
      .node.set(
        PDFName.of('Annots'),
        pdf.context.obj([{ Subtype: 'Link', A: { S: 'JavaScript', JS: 'test-only' } }]),
      );
    const nested = await request(app)
      .post('/api/admin/resume/file')
      .set('Cookie', adminCookie)
      .set('X-Portfolio-Request', 'cms')
      .attach('file', Buffer.from(await pdf.save()), {
        filename: 'resume.pdf',
        contentType: 'application/pdf',
      });
    expect(nested.status).toBe(422);
  });
  it('upgrades unchanged default navigation but preserves customized content and admins', async () => {
    const legacy = [
      ['Profile', '/'],
      ['Skills', '/skills'],
      ['Work', '/work'],
      ['Showroom', '/showroom'],
      ['About', '/about'],
      ['Contact', '/contact'],
    ];
    await NavigationItem.insertMany(
      legacy.map(([label, destination], order) => ({ label, destination, order, type: 'route' })),
    );
    await seedContent();
    expect((await NavigationItem.find().sort({ order: 1 })).map((v) => v.destination)).toEqual([
      '/',
      '/profile',
      '/skills',
      '/work',
      '/showroom',
      '/resume',
      '/about',
      '/contact',
    ]);
    await NavigationItem.updateOne({ label: 'Work' }, { destination: '/custom', order: 99 });
    await seedContent();
    expect((await NavigationItem.findOne({ label: 'Work' })).destination).toBe('/custom');
    expect((await User.findOne({ email: 'admin@test.dev' })).role).toBe('admin');
  });
});
describe('operational logging', () => {
  it('writes categorized logs while dropping sensitive metadata', async () => {
    const dir = path.join(folder, 'logs'),
      logger = createFileLogger(dir);
    const data = cleanLog('auth', 'auth.login', {
      userId: 'safe-user',
      password: 'DO_NOT_LOG',
      passwordHash: 'DO_NOT_LOG',
      token: 'DO_NOT_LOG',
      email: 'DO_NOT_LOG',
      body: { password: 'DO_NOT_LOG' },
      authorization: 'DO_NOT_LOG',
    });
    logger.info({ message: data.event, ...data });
    logger.error({
      message: 'application.error',
      ...cleanLog('error', 'application.error', { errorName: 'Error' }),
    });
    await new Promise((resolve) => {
      logger.on('finish', resolve);
      logger.end();
    });
    const names = await readdir(dir);
    expect(names).toContain('auth.log');
    expect(names).toContain('error.log');
    const auth = await readFile(path.join(dir, 'auth.log'), 'utf8');
    expect(auth).toContain('auth.login');
    expect(auth).not.toContain('DO_NOT_LOG');
    const status = await call('get', '/api/admin/operations');
    expect(status.body.data.database).toBe('connected');
    expect(JSON.stringify(status.body)).not.toContain(env.jwtSecret);
  });
});
