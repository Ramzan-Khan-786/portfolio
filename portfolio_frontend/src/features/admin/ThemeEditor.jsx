import { useEffect, useState } from 'react';
import { apiClient } from '../../lib/api.js';
import { usePortfolio } from '../../context/PortfolioContext.jsx';
import { themeCatalog, themeNames, themeDefaults, dailyTheme } from '../../../../shared/themes.js';
import { StatePanel } from '../../components/Ui.jsx';
import useUnsavedChanges from '../../hooks/useUnsavedChanges.js';
import './ThemeEditor.css';

const editable = (value) => ({
  mode: value.mode,
  universalTheme: value.universalTheme,
  enabledThemes: [...value.enabledThemes],
  allowVisitorOverride: value.allowVisitorOverride,
});
const modes = [
  {
    key: 'random-reload', title: 'Random on every reload', badge: 'Recommended',
    description: 'Pick a fresh theme when a tab opens or reloads. A visitor can change it for that visit.',
  },
  {
    key: 'universal', title: 'One default theme',
    description: 'Start each visit with your selected default. Personal choices reset on reload.',
  },
  {
    key: 'random-daily', title: 'Daily rotation',
    description: 'Use the same automatic theme for everyone on each UTC day.',
  },
];
const themeLabel = (name) => themeCatalog.find((theme) => theme.name === name)?.label || name;

export default function ThemeEditor({ notify }) {
  const { refresh } = usePortfolio();
  const [values, setValues] = useState(null);
  const [saved, setSaved] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [preview, setPreview] = useState('dark');
  const { dirty, markSaved } = useUnsavedChanges(values);

  useEffect(() => {
    let active = true;
    setError('');
    apiClient.get('themes').then((data) => {
      if (!active) return;
      const value = editable(data);
      setValues(value);
      setSaved(value);
      setPreview(value.universalTheme);
      markSaved(value);
    }).catch((failure) => { if (active) setError(failure.message); });
    return () => { active = false; };
  }, [attempt, markSaved]);

  async function save(event) {
    event.preventDefault();
    if (busy || !dirty) return;
    setBusy(true);
    setError('');
    try {
      const result = editable(await apiClient.put('themes', values));
      setValues(result);
      setSaved(result);
      markSaved(result);
      notify('Portfolio theme policy saved. Personal choices still reset on the next reload.');
      await refresh();
    } catch (failure) {
      setError(failure.message);
    } finally {
      setBusy(false);
    }
  }

  function setPool(pool) {
    if (!pool.length) { setError('Keep at least one theme enabled.'); return; }
    setError('');
    setValues((current) => ({
      ...current,
      enabledThemes: pool,
      universalTheme: pool.includes(current.universalTheme) ? current.universalTheme : pool[0],
    }));
  }

  function toggle(name) {
    setPool(values.enabledThemes.includes(name)
      ? values.enabledThemes.filter((theme) => theme !== name)
      : [...values.enabledThemes, name]);
  }

  function discard() {
    if (!window.confirm('Discard the unsaved theme policy changes?')) return;
    const value = editable(saved);
    setValues(value);
    markSaved(value);
    setError('');
  }

  const fallbackLabel = values?.mode === 'universal' ? 'default' : 'fallback';
  const filtered = themeCatalog.filter(({ name, label, tone }) =>
    label.toLowerCase().includes(query.trim().toLowerCase()) &&
    (filter === 'all' || filter === tone || (filter === 'enabled' && values?.enabledThemes.includes(name))),
  );

  return (
    <section className="theme-manager">
      <div className="cms-page-heading">
        <div>
          <p className="eyebrow">Appearance / portfolio policy</p>
          <h1>Theme management</h1>
          <p>Choose how visits start, manage the available palettes, then save. Previews do not change the live site.</p>
        </div>
      </div>
      <p className="theme-manager-intro">
        The sidebar selector changes only your current tab. This page controls the portfolio policy for all visitors.
      </p>
      {error && <p className="cms-error" role="alert">{error}</p>}
      {!values ? (
        <StatePanel
          loading={!error}
          title={error ? 'Unable to load themes' : 'Loading themes'}
          retry={error ? () => setAttempt((value) => value + 1) : undefined}
        />
      ) : (
        <form onSubmit={save}>
          <fieldset className="theme-manager-fields" disabled={busy}>
            <section className="cms-editor theme-policy-section">
              <div className="theme-section-heading">
                <div><h2>1. How should a visit start?</h2><p>These modes control the automatic selection, not the visitor’s temporary choice.</p></div>
                <span className="theme-status">{dirty ? 'Unsaved changes' : 'Saved policy'}</span>
              </div>
              <fieldset className="theme-mode-grid">
                <legend className="sr-only">Automatic theme mode</legend>
                {modes.map((mode) => (
                  <label className={'theme-mode-option ' + (values.mode === mode.key ? 'is-selected' : '')} key={mode.key}>
                    <span className="theme-mode-title">
                      <input type="radio" name="portfolio-theme-mode" value={mode.key}
                        checked={values.mode === mode.key}
                        onChange={() => setValues((current) => ({ ...current, mode: mode.key }))} />
                      <strong>{mode.title}</strong>
                    </span>
                    {mode.badge && <span className="theme-mode-badge">{mode.badge}</span>}
                    <span className="theme-mode-description">{mode.description}</span>
                  </label>
                ))}
              </fieldset>
              <p className="theme-policy-note">
                {values.mode === 'random-reload'
                  ? 'New tab or reload → random theme. Manual selection → kept while browsing this tab. Next reload → new random selection. With multiple themes enabled, the last displayed theme is avoided when browser storage is available.'
                  : values.mode === 'universal'
                    ? 'Each reload starts with the default theme. Visitors can pick another theme for this visit when the option below is enabled.'
                    : 'Today’s automatic theme: ' + themeLabel(dailyTheme(values)) + '. A visitor’s manual choice stays for this visit, even if the UTC day changes.'}
              </p>
              {values.mode === 'random-reload' && values.enabledThemes.length < 2 && (
                <p className="theme-pool-warning" role="status">Enable at least two palettes for a visible change between reloads.</p>
              )}
              <div className="theme-policy-controls">
                <label className="cms-field">
                  {values.mode === 'universal' ? 'Default theme' : 'Fallback theme'}
                  <select value={values.universalTheme}
                    onChange={(event) => setValues((current) => ({ ...current, universalTheme: event.target.value }))}>
                    {values.enabledThemes.map((name) => <option key={name} value={name}>{themeLabel(name)}</option>)}
                  </select>
                </label>
                <label className="theme-override-control">
                  <input type="checkbox" checked={values.allowVisitorOverride}
                    onChange={(event) => setValues((current) => ({ ...current, allowVisitorOverride: event.target.checked }))} />
                  <span><strong>Let visitors choose a theme</strong><small>Only for their current tab visit; never saved across reloads or shared with other tabs.</small></span>
                </label>
              </div>
            </section>

            <section className="cms-editor theme-policy-section">
              <div className="theme-section-heading">
                <div><h2>2. Available palettes</h2><p>The automatic picker and visitor selector use this enabled pool.</p></div>
                <span className="theme-status">{values.enabledThemes.length} / {themeNames.length} enabled</span>
              </div>
              <div className="theme-library-toolbar">
                <label className="cms-field">Find a palette
                  <input type="search" value={query} placeholder="Search themes"
                    onChange={(event) => setQuery(event.target.value)} />
                </label>
                <label className="cms-field">Show
                  <select value={filter} onChange={(event) => setFilter(event.target.value)}>
                    <option value="all">All themes</option><option value="light">Light themes</option>
                    <option value="dark">Dark themes</option><option value="enabled">Enabled only</option>
                  </select>
                </label>
              </div>
              <div className="theme-pool-actions" aria-label="Theme pool presets">
                <button type="button" className="btn btn-sm btn-outline" onClick={() => setPool([...themeNames])}>Enable all</button>
                <button type="button" className="btn btn-sm btn-outline" onClick={() => setPool(themeCatalog.filter((theme) => theme.tone === 'light').map((theme) => theme.name))}>Light only</button>
                <button type="button" className="btn btn-sm btn-outline" onClick={() => setPool(themeCatalog.filter((theme) => theme.tone === 'dark').map((theme) => theme.name))}>Dark only</button>
              </div>
              <div className="theme-library-layout">
                <div>
                  <div className="theme-palette-grid">
                    {filtered.map(({ name, label, tone }) => (
                      <article className={'theme-palette ' + (preview === name ? 'is-previewed' : '')} key={name}>
                        <div className="theme-palette-swatch" data-theme={name} aria-hidden="true">
                          <span className="theme-swatch-base" /><span className="theme-swatch-surface" />
                          <span className="theme-swatch-primary" /><span className="theme-swatch-content" />
                        </div>
                        <label className="theme-palette-toggle">
                          <input type="checkbox" checked={values.enabledThemes.includes(name)} onChange={() => toggle(name)} />
                          <strong>{label}</strong><small>{tone}</small>
                        </label>
                        <div className="theme-palette-actions">
                          <button type="button" aria-label={'Preview ' + label} aria-pressed={preview === name}
                            onClick={() => setPreview(name)}>Preview</button>
                          <button type="button" disabled={!values.enabledThemes.includes(name) || values.universalTheme === name}
                            aria-label={'Use ' + label + ' as the default or fallback theme'}
                            onClick={() => setValues((current) => ({ ...current, universalTheme: name }))}>
                            {values.universalTheme === name ? (fallbackLabel === 'default' ? 'Default ✓' : 'Fallback ✓') : 'Set ' + fallbackLabel}
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                  {!filtered.length && <p className="theme-no-results">No matching palettes. Clear the search or change the filter.</p>}
                </div>
                <aside className="theme-preview-pane" aria-label="Isolated theme preview">
                  <p className="theme-preview-caption">Preview · {themeLabel(preview)} · not applied</p>
                  <div className="theme-preview-sample" data-theme={preview}>
                    <p className="theme-preview-kicker">Ramzan Khan / Portfolio</p>
                    <h3>Engineering with intent.</h3>
                    <p>Readable text, clear surfaces and a restrained accent.</p>
                    <div className="theme-preview-surface"><strong>Project overview</strong><p>A secondary surface with supporting information.</p></div>
                    <div className="theme-preview-buttons" aria-hidden="true">
                      <span className="btn btn-primary btn-sm">Primary action</span>
                      <span className="btn btn-outline btn-sm">Secondary</span>
                    </div>
                  </div>
                  <p className="theme-preview-help">Previewing never changes the current tab or saves a policy. Use the sidebar selector to try a theme on the workspace.</p>
                </aside>
              </div>
            </section>
            <div className="theme-save-bar">
              <div><strong>{dirty ? 'Ready to apply your changes?' : 'No unsaved changes'}</strong><p>Only Save changes the portfolio policy.</p></div>
              <div className="theme-save-actions">
                <button type="button" className="btn btn-sm btn-ghost" onClick={() => {
                  if (window.confirm('Load random-on-reload defaults into this editor? Save to apply them.')) {
                    setValues(editable(themeDefaults));
                    setError('');
                  }
                }}>Restore defaults</button>
                {dirty && <button type="button" className="btn btn-sm btn-outline" onClick={discard}>Discard</button>}
                <button type="submit" className="btn btn-primary btn-sm" disabled={busy || !dirty}>{busy ? 'Saving…' : 'Save theme policy'}</button>
              </div>
            </div>
          </fieldset>
        </form>
      )}
    </section>
  );
}
