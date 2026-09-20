import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import ThemeSettings from '../models/ThemeSettings.js';
import ContentSection from '../models/ContentSection.js';
import { themeNames, themeModes, normalizeThemeSettings } from '../../../shared/themes.js';
import { ApiError, asyncHandler } from '../utils/ApiError.js';
import { audit } from '../services/logger.js';
const schema = z.object({
  mode: z.enum([...themeModes, 'random-device']).transform((mode) => mode === 'random-device' ? 'random-reload' : mode),
  universalTheme: z.enum(themeNames),
  enabledThemes: z.array(z.enum(themeNames)).min(1).max(themeNames.length).transform((value) => [...new Set(value)]),
  allowVisitorOverride: z.boolean(),
}).strict().refine((value) => value.enabledThemes.includes(value.universalTheme), { path: ['universalTheme'], message: 'Enable the universal fallback theme.' });
export async function readThemeSettings() {
  const settings = await ThemeSettings.findOne({ key: 'primary' }).lean();
  const legacy = !settings && await ContentSection.findOne({ key: 'appearance' }).lean();
  const clean = normalizeThemeSettings(settings || legacy?.data || {});
  return { mode: clean.mode, universalTheme: clean.universalTheme, enabledThemes: clean.enabledThemes,
    allowVisitorOverride: clean.allowVisitorOverride, revision: clean.revision || 'initial', dateBasis: 'UTC' };
}
export const getThemes = asyncHandler(async (_req, res) => {
  res.set('Cache-Control', 'no-store').json({ ok: true, data: await readThemeSettings() });
});
export const putThemes = asyncHandler(async (req, res) => {
  const input = schema.safeParse(req.body);
  if (!input.success) throw new ApiError(422, 'Check theme settings.', input.error.flatten());
  await ThemeSettings.findOneAndUpdate({ key: 'primary' }, { ...input.data, revision: randomUUID(), updatedBy: req.user.id }, { upsert: true, runValidators: true });
  audit('admin', 'theme.updated', { userId: req.user.id, mode: input.data.mode });
  res.json({ ok: true, data: await readThemeSettings() });
});
