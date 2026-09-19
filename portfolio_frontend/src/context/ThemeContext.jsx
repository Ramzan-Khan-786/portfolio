import { createContext, useContext, useEffect, useState } from 'react';
import { usePortfolio } from './PortfolioContext.jsx';
export const themes = [
  ['dark', 'Dark'],
  ['light', 'Light'],
  ['midnight', 'Midnight'],
  ['graphite', 'Graphite'],
  ['terminal', 'Fieldwork'],
];
const ThemeContext = createContext(null);
export function ThemeProvider({ children }) {
  const { content } = usePortfolio();
  const appearance = content.sections?.appearance || {};
  const [choice, setChoice] = useState(() => {
    try {
      return localStorage.getItem('portfolio-theme') || '';
    } catch {
      return '';
    }
  });
  const [system, setSystem] = useState(() =>
    window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light',
  );
  const allowed = themes.filter(
    ([key]) => !appearance.enabledThemes?.length || appearance.enabledThemes.includes(key),
  );
  const preferred =
    choice || (appearance.followSystem !== false ? system : appearance.defaultTheme) || system;
  const theme = allowed.some(([key]) => key === preferred)
    ? preferred
    : allowed.some(([key]) => key === appearance.defaultTheme)
      ? appearance.defaultTheme
      : allowed[0]?.[0] || 'dark';
  useEffect(() => {
    const query = window.matchMedia('(prefers-color-scheme: dark)');
    const change = () => setSystem(query.matches ? 'dark' : 'light');
    query.addEventListener('change', change);
    return () => query.removeEventListener('change', change);
  }, []);
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta)
      meta.content = getComputedStyle(document.documentElement).getPropertyValue('--bg').trim();
  }, [theme]);
  function select(value) {
    setChoice(value);
    try {
      if (value) localStorage.setItem('portfolio-theme', value);
      else localStorage.removeItem('portfolio-theme');
    } catch {
      /* Storage may be disabled. */
    }
  }
  return (
    <ThemeContext.Provider value={{ theme, choice, themes: allowed, select }}>
      {children}
    </ThemeContext.Provider>
  );
}
export function useTheme() {
  return useContext(ThemeContext);
}
