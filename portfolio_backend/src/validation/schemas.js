import { z } from 'zod';
const text = (min, max) => z.string().trim().min(min).max(max);
const webUrl = z
  .string()
  .trim()
  .max(2048)
  .url()
  .refine((value) => {
    try {
      const url = new URL(value);
      return ['http:', 'https:'].includes(url.protocol) && !url.username && !url.password;
    } catch {
      return false;
    }
  }, 'Use an HTTP or HTTPS URL without credentials.');
const optionalUrl = webUrl.or(z.literal('')).optional().default('');
const order = z.coerce.number().int().min(0).max(100000).default(0);
const slug = text(1, 160).regex(
  /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
  'Use lowercase words separated by hyphens.',
);
const internal = (value) =>
  /^\/(?!\/)[a-zA-Z0-9/#?=&._~-]*$/.test(value) || /^#[a-zA-Z][\w-]*$/.test(value);
const destination = z
  .string()
  .trim()
  .max(2048)
  .refine(
    (value) => internal(value) || webUrl.safeParse(value).success,
    'Use a local route, section anchor, or HTTP(S) URL.',
  );
export const loginSchema = z.object({
  email: text(3, 254).email(),
  password: z.string().min(8).max(128),
});
export const passwordSchema = z.object({
  currentPassword: z.string().min(8).max(128),
  newPassword: z
    .string()
    .min(12)
    .max(72)
    .refine(
      (value) => Buffer.byteLength(value, 'utf8') <= 72,
      'Use at most 72 UTF-8 bytes; accented characters and emoji can use more than one byte.',
    ),
});
export const profileSchema = z.object({
  name: text(2, 80),
  initials: text(1, 4).optional(),
  headline: text(4, 180),
  shortIntro: text(10, 360),
  bio: text(10, 4000),
  location: text(0, 120).optional(),
  availability: text(0, 140).optional(),
  profileImage: optionalUrl,
  resumeUrl: optionalUrl,
  focusAreas: z.array(text(1, 60)).max(12).default([]),
  primaryCtaLabel: text(0, 50).default('View work'),
  primaryCtaUrl: destination.default('/work'),
  secondaryCtaLabel: text(0, 50).default('Enter showroom'),
  secondaryCtaUrl: destination.default('/showroom'),
});
export const skillSchema = z.object({
  name: text(1, 80),
  category: text(1, 80),
  description: text(0, 280).default(''),
  order,
  visible: z.boolean().default(true),
});
export const projectSchema = z.object({
  title: text(1, 140),
  slug: slug.or(z.literal('')).optional(),
  summary: text(5, 360),
  description: text(0, 5000).default(''),
  category: text(0, 80).default(''),
  imageUrl: optionalUrl,
  screenshots: z.array(webUrl).max(8).default([]),
  technologies: z.array(text(1, 48)).max(20).default([]),
  githubUrl: optionalUrl,
  liveUrl: optionalUrl,
  status: z.enum(['active', 'maintained', 'archived', 'in-progress']).default('active'),
  year: z.coerce.number().int().min(2000).max(2100).optional(),
  featured: z.boolean().default(false),
  published: z.boolean().default(false),
  archived: z.boolean().default(false),
  order,
});
export const navigationSchema = z
  .object({
    label: text(1, 48),
    destination: text(1, 2048),
    type: z.enum(['anchor', 'route', 'external', 'action']).default('anchor'),
    order,
    enabled: z.boolean().default(true),
    visibleOnDesktop: z.boolean().default(true),
    visibleOnMobile: z.boolean().default(true),
  })
  .superRefine((value, ctx) => {
    const valid =
      value.type === 'anchor'
        ? /^#[a-zA-Z][\w-]*$/.test(value.destination)
        : value.type === 'route'
          ? /^\/(?!\/)[a-zA-Z0-9/#?=&._~-]*$/.test(value.destination)
          : value.type === 'external'
            ? webUrl.safeParse(value.destination).success
            : !value.enabled;
    if (!valid)
      ctx.addIssue({
        code: 'custom',
        path: ['destination'],
        message:
          value.type === 'action'
            ? 'Actions are reserved for future versions. Keep this item disabled.'
            : 'Destination does not match the selected type.',
      });
  });
export const showroomSchema = z
  .object({
    label: text(1, 80),
    project: z
      .string()
      .regex(/^[a-f\d]{24}$/i)
      .nullable()
      .optional()
      .default(null),
    description: text(0, 600).default(''),
    presentationType: z
      .enum(['sandbox', 'iframe', 'coming-soon'])
      .transform((value) => (value === 'sandbox' ? 'iframe' : value))
      .default('coming-soon'),
    embedUrl: optionalUrl,
    externalUrl: optionalUrl,
    status: z.enum(['live', 'coming-soon']).default('coming-soon'),
    order,
    enabled: z.boolean().default(true),
    isDefault: z.boolean().default(false),
  })
  .refine((value) => !value.isDefault || value.enabled, {
    path: ['isDefault'],
    message: 'Enable an item before making it the default.',
  });
export const socialSchema = z.object({
  label: text(1, 48),
  url: z
    .string()
    .trim()
    .max(2048)
    .refine(
      (value) => webUrl.safeParse(value).success || /^mailto:[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
      'Use an HTTP(S) URL or mailto:email address.',
    ),
  kind: text(1, 40),
  order,
  enabled: z.boolean().default(true),
});
export const settingSchema = z
  .object({
    key: text(1, 80).regex(/^[a-zA-Z][a-zA-Z0-9._-]*$/),
    value: z.string().trim().max(2000),
  })
  .superRefine(({ key, value }, ctx) => {
    if (key.startsWith('_') || key === 'defaultShowroomId')
      ctx.addIssue({
        code: 'custom',
        path: ['key'],
        message: 'This setting is managed by Showroom.',
      });
    if (key === 'contactEmail' && value && !z.string().email().safeParse(value).success)
      ctx.addIssue({ code: 'custom', path: ['value'], message: 'Enter a valid email address.' });
    if (key === 'siteUrl' && value && !webUrl.safeParse(value).success)
      ctx.addIssue({
        code: 'custom',
        path: ['value'],
        message: 'Enter the public HTTPS site URL.',
      });
  });
export const pageSchema = z.object({
  title: text(1, 120),
  slug: slug.refine(
    (value) =>
      !['admin', 'profile', 'skills', 'work', 'showroom', 'about', 'contact', 'api'].includes(
        value,
      ),
    'This route is reserved.',
  ),
  description: text(0, 300).default(''),
  body: text(1, 20000),
  published: z.boolean().default(false),
  order,
});
