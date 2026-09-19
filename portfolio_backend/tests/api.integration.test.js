import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import app from '../src/app.js';
import { env } from '../src/config/env.js';
import User from '../src/models/User.js';
import Project from '../src/models/Project.js';
import Profile from '../src/models/Profile.js';
import Setting from '../src/models/Setting.js';
import { seedContent } from '../src/services/seedContent.js';
let mongo, cookie, user;
const password = 'test-only-password-123';
const send = (method, path, body) =>
  request(app)[method](path).set('Cookie', cookie).set('X-Portfolio-Request', 'cms').send(body);
beforeAll(async () => {
  mongo = await MongoMemoryServer.create({ instance: { launchTimeout: 60000 } });
  await mongoose.connect(mongo.getUri());
  await Promise.all(Object.values(mongoose.models).map((model) => model.init()));
}, 120000);
beforeEach(async () => {
  await Promise.all(Object.values(mongoose.models).map((model) => model.deleteMany({})));
  user = await User.create({
    email: 'admin@test.dev',
    name: 'Test Admin',
    role: 'admin',
    passwordHash: await bcrypt.hash(password, 4),
  });
  const token = jwt.sign({ sub: user.id, version: 0 }, env.jwtSecret, {
    expiresIn: '1h',
    issuer: 'portfolio-api',
    audience: 'portfolio-admin',
  });
  cookie = 'portfolio_admin=' + token;
});
afterAll(async () => {
  await mongoose.disconnect();
  await mongo?.stop();
});

describe('authentication and boundaries', () => {
  it('rejects unauthenticated and tampered sessions', async () => {
    expect((await request(app).get('/api/admin/projects')).status).toBe(401);
    expect(
      (await request(app).get('/api/admin/projects').set('Cookie', 'portfolio_admin=bad')).status,
    ).toBe(401);
  });
  it('logs in with an HTTP-only cookie and does not expose password data', async () => {
    const result = await send('post', '/api/auth/login', { email: user.email, password });
    expect(result.status).toBe(200);
    expect(result.headers['set-cookie'][0]).toContain('HttpOnly');
    expect(result.body.data.user).not.toHaveProperty('passwordHash');
    expect(result.headers['cache-control']).toBe('no-store');
  });
  it('rejects wrong credentials without revealing whether email exists', async () => {
    const result = await send('post', '/api/auth/login', {
      email: user.email,
      password: 'wrong-password',
    });
    expect(result.status).toBe(401);
    expect(result.body.error.message).toBe('Invalid email or password.');
  });
  it('enforces administrator authorization independently of token claims', async () => {
    await User.collection.updateOne({ _id: user._id }, { $set: { role: 'reader' } });
    expect((await send('get', '/api/admin/projects')).status).toBe(403);
  });
  it('blocks cross-origin cookie mutations and missing custom headers', async () => {
    expect(
      (
        await request(app)
          .post('/api/admin/skills')
          .set('Cookie', cookie)
          .send({ name: 'JS', category: 'Languages' })
      ).status,
    ).toBe(403);
    expect(
      (
        await request(app)
          .post('/api/admin/skills')
          .set('Cookie', cookie)
          .set('X-Portfolio-Request', 'cms')
          .set('Origin', 'https://evil.example')
          .send({ name: 'JS', category: 'Languages' })
      ).status,
    ).toBe(403);
  });
  it('revokes a copied cookie on logout', async () => {
    expect((await send('post', '/api/auth/logout')).status).toBe(200);
    expect((await send('get', '/api/auth/me')).status).toBe(401);
  });
  it('changes passwords and revokes old sessions', async () => {
    const result = await send('put', '/api/auth/password', {
      currentPassword: password,
      newPassword: 'new-safe-password-123',
    });
    expect(result.status).toBe(200);
    expect((await send('get', '/api/auth/me')).status).toBe(401);
    expect(
      (
        await send('post', '/api/auth/login', {
          email: user.email,
          password: 'new-safe-password-123',
        })
      ).status,
    ).toBe(200);
  });
  it('returns safe errors for invalid IDs and malformed JSON', async () => {
    expect((await send('delete', '/api/admin/projects/invalid')).status).toBe(400);
    const malformed = await request(app)
      .post('/api/auth/login')
      .set('Content-Type', 'application/json')
      .set('X-Portfolio-Request', 'cms')
      .send('{ broken');
    expect(malformed.status).toBe(400);
    expect(JSON.stringify(malformed.body)).not.toContain('SyntaxError');
  });
});

describe('CMS and public content', () => {
  it('provides new CTA defaults for an older profile without overwriting stored content', async () => {
    await Profile.collection.insertOne({
      name: 'Existing profile',
      headline: 'Original headline',
      shortIntro: 'Original introduction',
      bio: 'Original biography',
    });
    const profile = (await request(app).get('/api/public/bootstrap')).body.data.profile;
    expect(profile.primaryCtaUrl).toBe('/work');
    expect(profile.secondaryCtaUrl).toBe('/showroom');
    expect(profile.headline).toBe('Original headline');
    expect(await Profile.collection.findOne({})).not.toHaveProperty('primaryCtaUrl');
  });
  const project = {
    title: 'Real project',
    summary: 'A useful application.',
    description: 'Full project details.',
    technologies: ['React'],
    published: true,
  };
  it('creates, reads, updates, unpublishes, and deletes projects', async () => {
    const created = await send('post', '/api/admin/projects', project);
    expect(created.status).toBe(201);
    expect(created.body.data.slug).toBe('real-project');
    expect(
      (await request(app).get('/api/public/projects/real-project')).body.data.description,
    ).toBe(project.description);
    expect(
      (
        await send('put', '/api/admin/projects/' + created.body.data._id, {
          ...project,
          published: false,
        })
      ).status,
    ).toBe(200);
    expect((await request(app).get('/api/public/projects/real-project')).status).toBe(404);
    expect((await request(app).get('/api/public/projects')).body.data).toHaveLength(0);
    expect((await send('delete', '/api/admin/projects/' + created.body.data._id)).status).toBe(204);
  });
  it('rejects duplicate slugs and unsafe URL schemes', async () => {
    await send('post', '/api/admin/projects', project);
    expect((await send('post', '/api/admin/projects', project)).status).toBe(409);
    expect(
      (await send('post', '/api/admin/projects', { ...project, liveUrl: 'javascript:alert(1)' }))
        .status,
    ).toBe(422);
  });
  it('supports navigation CRUD, visibility, ordering, and validated destinations', async () => {
    const body = { label: 'Experience', destination: '/experience', type: 'route', order: 2 };
    const created = await send('post', '/api/admin/navigation', body);
    expect(created.status).toBe(201);
    expect((await request(app).get('/api/public/navigation')).body.data[0].destination).toBe(
      '/experience',
    );
    expect(
      (
        await send('put', '/api/admin/navigation/' + created.body.data._id, {
          ...body,
          enabled: false,
        })
      ).status,
    ).toBe(200);
    expect((await request(app).get('/api/public/navigation')).body.data).toHaveLength(0);
    expect(
      (await send('post', '/api/admin/navigation', { ...body, destination: '//evil.test' })).status,
    ).toBe(422);
    expect((await send('delete', '/api/admin/navigation/' + created.body.data._id)).status).toBe(
      204,
    );
  });
  it('supports a published custom page and hides its draft', async () => {
    const body = {
      title: 'Experience',
      slug: 'experience',
      body: 'Professional experience.',
      published: true,
    };
    const created = await send('post', '/api/admin/pages', body);
    expect(created.status).toBe(201);
    expect((await request(app).get('/api/public/pages/experience')).body.data.body).toBe(body.body);
    await send('put', '/api/admin/pages/' + created.body.data._id, { ...body, published: false });
    expect((await request(app).get('/api/public/pages/experience')).status).toBe(404);
  });
  it('keeps exactly one effective showroom default and falls back after disabling it', async () => {
    const body = {
      label: 'First',
      isDefault: true,
      enabled: true,
      presentationType: 'coming-soon',
    };
    const first = await send('post', '/api/admin/showroom', body);
    const second = await send('post', '/api/admin/showroom', {
      ...body,
      label: 'Second',
      order: 1,
    });
    let items = (await request(app).get('/api/public/showroom')).body.data;
    expect(items.filter((item) => item.isDefault).map((item) => item.label)).toEqual(['Second']);
    await send('put', '/api/admin/showroom/' + second.body.data._id, {
      ...body,
      label: 'Second',
      enabled: false,
      isDefault: false,
    });
    items = (await request(app).get('/api/public/showroom')).body.data;
    expect(items[0]._id).toBe(first.body.data._id);
    expect(items[0].isDefault).toBe(true);
    expect((await send('delete', '/api/admin/showroom/' + first.body.data._id)).status).toBe(204);
    expect((await request(app).get('/api/public/showroom')).body.data).toHaveLength(0);
  });
  it('validates project associations and protects private settings and unpublished projects', async () => {
    const hidden = await Project.create({ ...project, slug: 'draft', published: false });
    await Setting.create({ key: 'privateNote', value: 'not-public' });
    const body = {
      label: 'Preview',
      project: hidden.id,
      status: 'live',
      presentationType: 'iframe',
    };
    expect((await send('post', '/api/admin/showroom', body)).status).toBe(201);
    expect(
      (
        await send('post', '/api/admin/showroom', {
          ...body,
          project: new mongoose.Types.ObjectId().toString(),
        })
      ).status,
    ).toBe(422);
    const data = (await request(app).get('/api/public/bootstrap')).body.data;
    expect(data.showroom[0].project).toBeNull();
    expect(data.projects).toHaveLength(0);
    expect(data.settings).toHaveLength(0);
  });
  it('removes a deleted project association without deleting the showroom item', async () => {
    const created = await send('post', '/api/admin/projects', project);
    await send('post', '/api/admin/showroom', {
      label: 'Experience',
      project: created.body.data._id,
    });
    await send('delete', '/api/admin/projects/' + created.body.data._id);
    expect((await send('get', '/api/admin/showroom')).body.data[0].project).toBeNull();
  });
  it('saves profile, skills, social links and settings through real APIs', async () => {
    const profile = {
      name: 'Ramzan Khan',
      headline: 'Software engineer',
      shortIntro: 'A useful introduction.',
      bio: 'A professional biography.',
      focusAreas: [],
    };
    expect((await send('put', '/api/admin/profile', profile)).status).toBe(200);
    const skill = await send('post', '/api/admin/skills', { name: 'Node.js', category: 'Backend' });
    expect(skill.status).toBe(201);
    expect(
      (
        await send('post', '/api/admin/socials', {
          label: 'Email',
          kind: 'email',
          url: 'mailto:person@example.com',
        })
      ).status,
    ).toBe(201);
    expect(
      (
        await send('post', '/api/admin/settings', {
          key: 'contactEmail',
          value: 'person@example.com',
        })
      ).status,
    ).toBe(201);
    const data = (await request(app).get('/api/public/bootstrap')).body.data;
    expect(data.profile.name).toBe('Ramzan Khan');
    expect(data.skills[0].name).toBe('Node.js');
    expect(data.socials[0].url).toContain('mailto:');
    expect(data.settings[0].value).toBe('person@example.com');
  });
  it('seeding preserves existing CMS content and credentials', async () => {
    await seedContent();
    const item = await Project.findOne({ slug: 'typewriter' });
    item.summary = 'My edited description';
    await item.save();
    const before = await User.findById(user.id).select('+passwordHash');
    await seedContent();
    expect((await Project.findById(item.id)).summary).toBe('My edited description');
    expect((await User.findById(user.id).select('+passwordHash')).passwordHash).toBe(
      before.passwordHash,
    );
  });
});
