import { z } from 'zod';
import { mediaReference } from './media.js';
import { destination, optionalUrl } from './schemas.js';
const line = (max = 240) => z.string().trim().max(max).default('');
const list = (max = 240) => z.array(z.string().trim().min(1).max(max)).max(30).default([]);
const link = z.object({ label: z.string().trim().min(1).max(60), url: destination }).strict();
const timeline = z
  .array(
    z
      .object({
        title: z.string().trim().min(1).max(160),
        organization: line(160),
        period: line(80),
        description: line(1200),
      })
      .strict(),
  )
  .max(30)
  .default([]);
const visible = z.boolean().default(true);
export const themeKeys = ['dark', 'light', 'midnight', 'graphite', 'terminal'];
export const sectionSchemas = {
  hero: z
    .object({
      visible,
      eyebrow: line(100),
      greeting: line(80),
      name: line(80),
      imageMedia: mediaReference,
      imagePosition: z.enum(['center', 'top', 'bottom', 'left', 'right']).default('center'),
      imageVisible: visible,
      headline: line(180),
      introduction: line(600),
      imageUrl: optionalUrl,
      actions: z.array(link).max(3).default([]),
    })
    .strict(),
  profile: z
    .object({
      visible,
      title: line(120),
      introduction: line(3000),
      currentFocus: line(1000),
      education: timeline,
      highlights: list(),
      interests: list(100),
      achievements: list(400),
    })
    .strict(),
  about: z
    .object({
      visible,
      title: line(120),
      subtitle: line(300),
      heading: line(160),
      body: line(8000),
      imageMedia: mediaReference,
      principles: list(500),
      experience: timeline,
    })
    .strict(),
  contact: z
    .object({
      visible,
      title: line(120),
      subtitle: line(300),
      heading: line(160),
      description: line(1600),
      email: z.string().trim().email().or(z.literal('')).default(''),
      showEmail: visible,
      showSocials: visible,
      ctaLabel: line(60),
      ctaUrl: destination.or(z.literal('')).default(''),
      note: line(300),
    })
    .strict(),
  footer: z
    .object({
      copyright: line(180),
      showSocials: visible,
      showCopyright: visible,
      links: z.array(link).max(4).default([]),
    })
    .strict(),
  appearance: z
    .object({
      defaultTheme: z.enum(themeKeys).default('dark'),
      followSystem: visible,
      enabledThemes: z.array(z.enum(themeKeys)).min(1).max(5).default(themeKeys),
    })
    .strict()
    .refine((v) => v.enabledThemes.includes(v.defaultTheme), {
      path: ['defaultTheme'],
      message: 'The default theme must be enabled.',
    }),
};
export const resumeSchema = z
  .object({
    title: line(120),
    description: line(600),
    visible,
    downloadEnabled: visible,
    externalUrl: optionalUrl,
    lastUpdated: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .refine((v) => {
        const d = new Date(v);
        return !Number.isNaN(d.valueOf()) && d.toISOString().slice(0, 10) === v;
      }, 'Enter a valid date.')
      .or(z.literal(''))
      .default(''),
    links: z.array(link).max(12).default([]),
  })
  .strict();
