import { normalizeThemeSettings, resolveTheme } from '../../../shared/themes.js';

export const THEME_KEYS = {
  settings: 'portfolio-theme-settings-v2',
  lastViewed: 'portfolio-theme-last-viewed-v3',
};

export function readStored(key, fallback = null) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
  catch { return fallback; }
}

export function writeStored(key, value) {
  try {
    const serialized = JSON.stringify(value);
    if (localStorage.getItem(key) !== serialized) localStorage.setItem(key, serialized);
    return true;
  } catch { return false; }
}

// Shared by the blocking head initializer and React, but never persisted.
// A full document reload/new tab creates a fresh visit; SPA navigation does not.
export function themeVisit() {
  if (!window.__portfolioThemeVisit) {
    let previousTheme = '';
    try { previousTheme = sessionStorage.getItem(THEME_KEYS.lastViewed) || ''; }
    catch { /* Storage is optional; the current visit still works in memory. */ }
    window.__portfolioThemeVisit = { choice: '', randomTheme: '', previousTheme };
  }
  return window.__portfolioThemeVisit;
}

export function randomReloadTheme(settings) {
  const visit = themeVisit();
  if (settings.enabledThemes.includes(visit.randomTheme)) return visit.randomTheme;
  // With two or more enabled themes, avoid the last displayed theme on reload.
  const alternatives = settings.enabledThemes.filter((name) => name !== visit.previousTheme);
  const pool = alternatives.length ? alternatives : settings.enabledThemes;
  let value = Math.random();
  try {
    const random = new Uint32Array(1);
    window.crypto.getRandomValues(random);
    value = random[0] / 4294967296;
  } catch { /* Non-security-sensitive appearance choice. */ }
  visit.randomTheme = pool[Math.floor(value * pool.length)] || settings.universalTheme;
  return visit.randomTheme;
}

export function rememberResolvedTheme(theme) {
  // This is only an exclusion hint for the next draw, NOT a saved selection.
  try { sessionStorage.setItem(THEME_KEYS.lastViewed, theme); }
  catch { /* If storage is blocked, a later reload may repeat a random theme. */ }
}

export function initializeTheme() {
  const settings = normalizeThemeSettings(readStored(THEME_KEYS.settings, {}));
  const random = settings.mode === 'random-reload' ? randomReloadTheme(settings) : '';
  const theme = resolveTheme(settings, themeVisit().choice, random);
  document.documentElement.dataset.theme = theme;
  rememberResolvedTheme(theme);
}
