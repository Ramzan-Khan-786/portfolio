import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { connectDatabase, disconnectDatabase } from '../config/database.js';
import User from '../models/User.js';
import { seedContent } from '../services/seedContent.js';
import { audit, logger } from '../services/logger.js';
async function seed() {
  const email = z.string().email().parse(process.env.SEED_ADMIN_EMAIL).toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD,
    typewriterUrl = process.env.TYPEWRITER_URL || '';
  if (typewriterUrl) {
    const url = new URL(typewriterUrl);
    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password)
      throw new Error('TYPEWRITER_URL must be an HTTP(S) URL without credentials.');
  }
  await connectDatabase();
  const existing = await User.findOne({ email });
  if (existing && existing.role !== 'admin')
    throw new Error(
      'The seed email belongs to a normal user. Use a different administrator email; seed never elevates existing accounts.',
    );
  if (!existing) {
    if (
      !password ||
      password.length < 12 ||
      Buffer.byteLength(password, 'utf8') > 72 ||
      /change-this|replace-with/.test(password)
    )
      throw new Error(
        'Set a unique administrator password of 12 characters or more, up to 72 UTF-8 bytes.',
      );
    await User.create({
      email,
      passwordHash: await bcrypt.hash(password, 12),
      name: 'Ramzan Khan',
      role: 'admin',
    });
  }
  await seedContent({ typewriterUrl });
  audit('application', 'seed.complete');
  console.info(
    'Initial content is ready. Existing content and credentials were preserved; unchanged legacy navigation was upgraded.',
  );
}
seed()
  .catch(() => {
    audit('error', 'application.failed', { code: 'seed_failed' });
    console.error(
      'Seed failed. Check administrator configuration, email ownership, and database connectivity.',
    );
    process.exitCode = 1;
  })
  .finally(async () => {
    await disconnectDatabase();
    logger.end();
  });
