import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { usePortfolio } from './PortfolioContext.jsx';
import {
  normalizeThemeSettings, resolveTheme, themeCatalog, legacyThemes,
} from '../../../shared/themes.js';
import {
  THEME_KEYS, readStored, writeStored, themeVisit, randomReloadTheme, rememberResolvedTheme,
} from '../lib/themeStorage.js';
import { apiClient } from '../lib/api.js';

export const themes = themeCatalog.map(({ name, label }) => [name, label]);
const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const { content } = usePortfolio();
  const [remote, setRemote] = useState(null);
  const [choice, setChoice] = useState(() => themeVisit().choice);
  const [tick, setTick] = useState(0);
  const settings = useMemo(
    () => normalizeThemeSettings(remote || content.themeSettings || readStored(THEME_KEYS.settings, {})),
    [remote, content.themeSettings],
  );
  const randomTheme = useMemo(
    () => settings.mode === 'random-reload' ? randomReloadTheme(settings) : '',
    [settings],
  );
  const effectiveChoice = settings.allowVisitorOverride && settings.enabledThemes.includes(choice)
    ? choice : '';
  const automaticTheme = useMemo(
    () => resolveTheme(settings, '', randomTheme, new Date()),
    [settings, randomTheme, tick],
  );
  const theme = effectiveChoice || automaticTheme;

  useEffect(() => { setRemote(null); }, [content.themeSettings]);
  useEffect(() => {
    let active = true;
    let request = 0;
    const refresh = () => {
      const current = ++request;
      setTick((value) => value + 1);
      apiClient.themes().then((value) => {
        if (active && current === request) setRemote(value);
      }).catch(() => {});
    };
    const focus = () => { if (!document.hidden) refresh(); };
    const storage = (event) => {
      // Policy changes can sync across tabs; a visitor's choice never does.
      if (event.key === THEME_KEYS.settings || event.key === null) focus();
    };
    const timer = setInterval(focus, 60000);
    window.addEventListener('focus', focus);
    window.addEventListener('storage', storage);
    document.addEventListener('visibilitychange', focus);
    return () => {
      active = false;
      clearInterval(timer);
      window.removeEventListener('focus', focus);
      window.removeEventListener('storage', storage);
      document.removeEventListener('visibilitychange', focus);
    };
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    writeStored(THEME_KEYS.settings, settings);
    rememberResolvedTheme(theme);
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = getComputedStyle(document.documentElement).backgroundColor;
  }, [theme, settings]);

  function select(value) {
    const next = legacyThemes[value] || value;
    if (next && (!settings.allowVisitorOverride || !settings.enabledThemes.includes(next))) return;
    themeVisit().choice = next;
    setChoice(next);
  }

  return (
    <ThemeContext.Provider value={{
      theme, automaticTheme, choice: effectiveChoice, settings,
      themes: themes.filter(([key]) => settings.enabledThemes.includes(key)),
      select,
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() { return useContext(ThemeContext); }
