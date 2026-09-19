import { Palette } from 'lucide-react';
import { useTheme } from '../context/ThemeContext.jsx';
import './ThemeSelector.css';
export default function ThemeSelector() {
  const context = useTheme();
  if (!context) return null;
  return (
    <label className="theme-selector" title="Choose appearance">
      <Palette size={16} aria-hidden="true" />
      <span className="sr-only">Theme</span>
      <select
        aria-label="Theme"
        value={context.themes.some(([key]) => key === context.choice) ? context.choice : ''}
        onChange={(event) => context.select(event.target.value)}
      >
        <option value="">Automatic</option>
        {context.themes.map(([key, label]) => (
          <option key={key} value={key}>
            {label}
          </option>
        ))}
      </select>
    </label>
  );
}
