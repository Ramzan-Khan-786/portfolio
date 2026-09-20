import { useEffect, useState } from 'react';
import { apiClient } from '../../lib/api.js';
import { usePortfolio } from '../../context/PortfolioContext.jsx';
import { StatePanel } from '../../components/Ui.jsx';
import FormFields from './FormFields.jsx';
import useUnsavedChanges from '../../hooks/useUnsavedChanges.js';
import { toForm, toPayload } from './config.js';
export default function ContentEditor({ section, config, notify }) {
  const { refresh } = usePortfolio();
  const [values, setValues] = useState(null),
    [error, setError] = useState(''),
    [errors, setErrors] = useState({}),
    [busy, setBusy] = useState(false),
    [attempt, setAttempt] = useState(0);
  const { markSaved } = useUnsavedChanges(values);
  useEffect(() => {
    let active = true;
    setError('');
    apiClient
      .get('content/' + section)
      .then((data) => {
        if (active) { const value = toForm(data, config.fields); setValues(value); markSaved(value); }
      })
      .catch((e) => {
        if (active) setError(e.message);
      });
    return () => {
      active = false;
    };
  }, [section, config, attempt, markSaved]);
  async function save(event) {
    event.preventDefault();
    setBusy(true);
    setError('');
    setErrors({});
    try {
      await apiClient.put('content/' + section, toPayload(values, config.fields));
      markSaved(values);
      notify(config.title + ' saved.');
      refresh();
    } catch (e) {
      setError(e.message);
      setErrors(e.details?.fieldErrors || {});
    } finally {
      setBusy(false);
    }
  }
  return (
    <section>
      <div className="cms-page-heading">
        <div>
          <p className="eyebrow">Portfolio / content</p>
          <h1>{config.title}</h1>
          <p>{config.description}</p>
        </div>
      </div>
      {error && (
        <p className="cms-error" role="alert">
          {error}
        </p>
      )}
      {values ? (
        <form className="cms-editor" onSubmit={save}>
          <fieldset disabled={busy}>
            <FormFields
              fields={config.fields}
              values={values}
              errors={errors}
              onChange={(name, value) => setValues((current) => ({ ...current, [name]: value }))}
            />
          </fieldset>
          <button className="admin-primary mt-6" disabled={busy}>
            {busy ? 'Saving…' : 'Save ' + config.title.toLowerCase()}
          </button>
        </form>
      ) : (
        <StatePanel
          loading={!error}
          title={error ? 'Unable to load content' : 'Loading content'}
          retry={error ? () => setAttempt(attempt + 1) : undefined}
        />
      )}
    </section>
  );
}
