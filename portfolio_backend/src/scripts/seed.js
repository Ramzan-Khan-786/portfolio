import bcrypt from 'bcryptjs';

import { z } from 'zod';

import { connectDatabase, disconnectDatabase } from '../config/database.js';

import User from '../models/User.js';

import { seedContent } from '../services/seedContent.js';

async function seed() {
  console.log('[SEED] Starting seed process...');

  const rawEmail = process.env.SEED_ADMIN_EMAIL;
  const password = process.env.SEED_ADMIN_PASSWORD;
  const typewriterUrl = process.env.TYPEWRITER_URL || '';

  console.log('[SEED] Environment check:');
  console.log('[SEED] SEED_ADMIN_EMAIL:', rawEmail ? '(configured)' : '(missing)');
  console.log(
    '[SEED] SEED_ADMIN_PASSWORD:',
    password ? `(present, ${password.length} characters)` : '(missing)',
  );
  console.log('[SEED] TYPEWRITER_URL:', typewriterUrl ? '(configured)' : '(empty)');

  if (!rawEmail) {
    throw new Error('SEED_ADMIN_EMAIL is missing.');
  }

  const email = z.string().email().parse(rawEmail).toLowerCase();

  console.log('[SEED] Admin email validated.');

  if (typewriterUrl && !/^https?:\/\//.test(typewriterUrl)) {
    throw new Error('TYPEWRITER_URL must use HTTP or HTTPS.');
  }

  console.log('[SEED] Connecting to MongoDB...');

  await connectDatabase();

  console.log('[SEED] MongoDB connection established.');

  console.log('[SEED] Checking whether admin user already exists...');

  const existingUser = await User.findOne({ email }).select('+passwordHash');

  if (existingUser) {
    console.log('[SEED] Admin user already exists.');
    console.log('[SEED] User ID:', existingUser._id.toString());
    console.log('[SEED] User name:', existingUser.name);
    console.log('[SEED] User role:', existingUser.role || '(undefined)');
    console.log('[SEED] Password hash:', existingUser.passwordHash ? '(present)' : '(missing)');

    console.log('[SEED] Existing credentials were preserved. Password was NOT changed.');
  } else {
    console.log('[SEED] Admin user does not exist. Creating new admin user...');

    if (!password) {
      throw new Error('SEED_ADMIN_PASSWORD is missing.');
    }

    if (password.length < 12) {
      throw new Error(
        `SEED_ADMIN_PASSWORD is too short: ${password.length} characters. Minimum is 12.`,
      );
    }

    if (Buffer.byteLength(password, 'utf8') > 72) {
      throw new Error('SEED_ADMIN_PASSWORD exceeds the bcrypt limit of 72 UTF-8 bytes.');
    }

    if (/change-this|replace-with/.test(password)) {
      throw new Error('SEED_ADMIN_PASSWORD is still using a placeholder value.');
    }

    console.log('[SEED] Password validation passed.');
    console.log('[SEED] Hashing admin password with bcrypt...');

    const passwordHash = await bcrypt.hash(password, 12);

    console.log('[SEED] Password hash generated.');

    const createdUser = await User.create({
      email,
      passwordHash,
      name: 'Ramzan Khan',
    });

    console.log('[SEED] Admin user created successfully.');
    console.log('[SEED] User ID:', createdUser._id.toString());
    console.log('[SEED] User name:', createdUser.name);
    console.log('[SEED] User role:', createdUser.role || '(undefined)');
  }

  console.log('[SEED] Seeding portfolio content...');

  await seedContent({ typewriterUrl });

  console.log('[SEED] Portfolio content seeded successfully.');
  console.info('[SEED] Initial content is ready. Existing content and credentials were preserved.');
}

seed()
  .catch((error) => {
    console.error('[SEED] Seed failed.');
    console.error('[SEED] Error:', error.message);
    console.error('[SEED] Stack:', error.stack);
    process.exitCode = 1;
  })
  .finally(async () => {
    console.log('[SEED] Disconnecting from MongoDB...');

    try {
      await disconnectDatabase();
      console.log('[SEED] MongoDB disconnected.');
    } catch (error) {
      console.error('[SEED] Failed to disconnect from MongoDB:', error.message);
    }
  });
