import { useId } from 'react';
import { Palette } from 'lucide-react';
import { useTheme } from '../context/ThemeContext.jsx';
import './ThemeSelector.css';

export default function ThemeSelector({ variant = 'compact' }) {
  const context = useTheme();
  const id = useId();
  if (!context) return null;
  const { automaticTheme, choice, themes, settings, select } = context;
  const label = themes.find(([key]) => key === automaticTheme)?.[1] || automaticTheme;
  const automatic = settings.mode === 'random-reload' ? 'Random' : 'Default';
  const help = !settings.allowVisitorOverride
    ? 'Theme changes are locked by the portfolio administrator.'
    : 'Your choice applies to this tab until its next reload. It does not change the portfolio policy.';
  const selector = (
    <label className="theme-selector" title={help}>
      <Palette size={16} aria-hidden="true" />
      <span className="sr-only">{variant === 'admin' ? 'Workspace theme for this visit' : 'Theme'}</span>
      <select
        aria-label={variant === 'admin' ? 'Workspace theme for this visit' : 'Theme'}
        aria-describedby={variant === 'admin' ? id : undefined}
        disabled={!settings.allowVisitorOverride}
        value={choice}
        onChange={(event) => select(event.target.value)}
      >
        <option value="">{automatic}: {label}</option>
        {themes.map(([key, name]) => <option key={key} value={key}>{name}</option>)}
      </select>
    </label>
  );
  if (variant !== 'admin') return selector;
  return (
    <div className="workspace-theme">
      <div className="workspace-theme-heading">
        <strong>This visit’s appearance</strong>
        <span>{choice ? 'Personal' : 'Automatic'}</span>
      </div>
      {selector}
      <p id={id}>{help}</p>
      {choice && (
        <button type="button" className="workspace-theme-reset" onClick={() => select('')}>
          Return to automatic
        </button>
      )}
    </div>
  );
}
