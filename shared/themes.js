// One catalogue for daisyUI, API validation and the browser.
export const themeCatalog = [
  { name: 'light', label: 'Light', tone: 'light' },
  { name: 'dark', label: 'Dark', tone: 'dark' },
  { name: 'corporate', label: 'Corporate', tone: 'light' },
  { name: 'business', label: 'Business', tone: 'dark' },
  { name: 'night', label: 'Night', tone: 'dark' },
  { name: 'dim', label: 'Dim', tone: 'dark' },
  { name: 'nord', label: 'Nord', tone: 'light' },
  { name: 'coffee', label: 'Coffee', tone: 'dark' },
  { name: 'winter', label: 'Winter', tone: 'light' },
  { name: 'sunset', label: 'Sunset', tone: 'dark' },
];
export const themeNames = themeCatalog.map(({ name }) => name);
export const themeModes = ['universal', 'random-reload', 'random-daily'];
export const themeDefaults = {
  mode: 'random-reload',
  universalTheme: 'dark',
  enabledThemes: [...themeNames],
  allowVisitorOverride: true,
  revision: 'initial',
};
export const legacyThemes = { midnight: 'night', graphite: 'business', terminal: 'coffee' };

export function normalizeThemeSettings(value = {}) {
  value = value && typeof value === 'object' && !Array.isArray(value) ? value : {};
  const requested = Array.isArray(value.enabledThemes) ? value.enabledThemes : themeNames;
  const pool = [...new Set(
    requested.filter((key) => typeof key === 'string').map((key) => legacyThemes[key] || key),
  )].filter((key) => themeNames.includes(key));
  const enabledThemes = pool.length ? pool : ['dark'];
  const preferred = legacyThemes[value.universalTheme || value.defaultTheme]
    || value.universalTheme || value.defaultTheme || themeDefaults.universalTheme;
  // Existing per-device random policies adopt the requested reload behavior.
  // Explicit fixed/daily policies and legacy fixed-theme settings stay intact.
  const mode = value.mode === 'random-device' ? 'random-reload' : value.mode;
  return {
    enabledThemes,
    revision: typeof value.revision === 'string' ? value.revision : themeDefaults.revision,
    mode: themeModes.includes(mode) ? mode : value.defaultTheme ? 'universal' : themeDefaults.mode,
    universalTheme: enabledThemes.includes(preferred) ? preferred : enabledThemes[0],
    allowVisitorOverride: value.allowVisitorOverride !== false,
  };
}

export function dailyTheme(settings, date = new Date()) {
  const day = Math.floor(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()) / 86400000);
  const pool = [...settings.enabledThemes].sort();
  return pool[((day % pool.length) + pool.length) % pool.length];
}

export function resolveTheme(settings, override, reloadTheme, date = new Date()) {
  const preferred = legacyThemes[override] || override;
  if (settings.allowVisitorOverride && settings.enabledThemes.includes(preferred)) return preferred;
  if (settings.mode === 'random-daily') return dailyTheme(settings, date);
  if (settings.mode === 'random-reload' && settings.enabledThemes.includes(reloadTheme)) return reloadTheme;
  return settings.universalTheme || 'dark';
}
