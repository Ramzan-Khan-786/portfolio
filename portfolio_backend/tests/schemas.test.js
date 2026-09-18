import { describe, expect, it } from 'vitest';
import {
  navigationSchema,
  passwordSchema,
  projectSchema,
  showroomSchema,
} from '../src/validation/schemas.js';
import { slugify } from '../src/utils/slugify.js';

describe('CMS input contracts', () => {
  it('rejects passwords that bcrypt would silently truncate by byte length', () => {
    expect(
      passwordSchema.safeParse({
        currentPassword: 'current-password',
        newPassword: '🔐'.repeat(20),
      }).success,
    ).toBe(false);
    expect(
      passwordSchema.safeParse({
        currentPassword: 'current-password',
        newPassword: 'safe-long-password',
      }).success,
    ).toBe(true);
  });
  it('accepts a future navigation destination without changing source code', () => {
    const result = navigationSchema.safeParse({
      label: 'Engineering',
      destination: '/engineering',
      type: 'route',
      order: 7,
      enabled: true,
      visibleOnDesktop: true,
      visibleOnMobile: true,
    });
    expect(result.success).toBe(true);
  });
  it('rejects invalid public project URLs', () => {
    expect(
      projectSchema.safeParse({
        title: 'Project',
        summary: 'A useful project',
        imageUrl: 'not a url',
      }).success,
    ).toBe(false);
  });
  it('allows an upcoming showroom item with no project association', () => {
    expect(
      showroomSchema.safeParse({
        label: 'Future',
        project: null,
        presentationType: 'coming-soon',
        status: 'coming-soon',
      }).success,
    ).toBe(true);
  });
  it('creates stable project slugs', () =>
    expect(slugify('TypeWriter / V1!')).toBe('typewriter-v1'));
});
