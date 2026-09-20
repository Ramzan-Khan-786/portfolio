import { useEffect, useRef, useState } from 'react';
import { Plus, Save, Trash2, X } from 'lucide-react';
import { apiClient } from '../../lib/api.js';
import { resources, toForm, toPayload } from './config.js';
import FormFields from './FormFields.jsx';
import { StatePanel } from '../../components/Ui.jsx';
import { usePortfolio } from '../../context/PortfolioContext.jsx';
import './ResourceManager.css';
import useUnsavedChanges from '../../hooks/useUnsavedChanges.js';
export default function ResourceManager({ resource, notify }) {
  const config = resources[resource];
  const { refresh } = usePortfolio();
  const [records, setRecords] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editor, setEditor] = useState(null);
  const [values, setValues] = useState({});
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const editorRef = useRef(null);
  const { dirty, markSaved } = useUnsavedChanges(values);
  const close = () => { if (!dirty || window.confirm('Discard unsaved changes?')) { markSaved(values); setEditor(null); } };
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    Promise.all([
      apiClient.get(resource),
      resource === 'showroom' ? apiClient.get('projects') : Promise.resolve([]),
    ])
      .then(([list, options]) => {
        if (active) {
          setRecords(list);
          setProjects(options);
        }
      })
      .catch((failure) => {
        if (active) setError(failure.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [resource, attempt]);
  useEffect(() => {
    if (editor) editorRef.current?.querySelector('input,select,textarea')?.focus();
  }, [editor]);
  function open(record = config.defaults) {
    if (editor && dirty && !window.confirm('Discard unsaved changes and open another record?')) return;
    setEditor(record);
    const value = toForm(record, config.fields);
    setValues(value); markSaved(value);
    setError('');
    setFieldErrors({});
  }
  async function save(event) {
    event.preventDefault();
    setBusy(true);
    setError('');
    setFieldErrors({});
    try {
      await apiClient.save(resource, toPayload(values, config.fields), editor._id);
      markSaved(values);
      notify(config.singular + ' saved.');
      setEditor(null);
      setAttempt((value) => value + 1);
      refresh();
    } catch (failure) {
      setError(failure.message);
      setFieldErrors(failure.details?.fieldErrors || {});
    } finally {
      setBusy(false);
    }
  }
  async function remove(record) {
    const label = record.title || record.label || record.name || record.key;
    if (!window.confirm('Delete “' + label + '”? This cannot be undone.')) return;
    setBusy(true);
    setError('');
    try {
      await apiClient.remove(resource, record._id);
      if (editor?._id === record._id) { markSaved(values); setEditor(null); }
      notify('Record deleted.');
      setAttempt((value) => value + 1);
      refresh();
    } catch (failure) {
      setError(failure.message);
    } finally {
      setBusy(false);
    }
  }
  const display = (value) => (typeof value === 'boolean' ? (value ? 'Yes' : 'No') : (value ?? '—'));
  return (
    <section>
      <div className="cms-page-heading">
        <div>
          <p className="eyebrow">Workspace / content</p>
          <h1>{config.title}</h1>
          <p>{config.description}</p>
        </div>
        <button disabled={busy} className="admin-primary" onClick={() => open()}>
          <Plus size={17} />
          Add {config.singular}
        </button>
      </div>
      {error && (
        <div role="alert" className="cms-error">
          {error}
          {!editor && (
            <button className="ml-3 underline" onClick={() => setAttempt(attempt + 1)}>
              Retry
            </button>
          )}
        </div>
      )}
      {editor && (
        <form ref={editorRef} className="cms-editor" onSubmit={save}>
          <div className="mb-6 flex items-center justify-between gap-4">
            <h2 className="text-lg font-semibold">
              {editor._id ? 'Edit ' : 'New '}
              {config.singular}
            </h2>
            <button
              className="cms-icon"
              type="button"
              disabled={busy}
              aria-label="Close editor"
              onClick={close}
            >
              <X size={18} />
            </button>
          </div>
          <fieldset disabled={busy}>
            <FormFields
              fields={config.fields}
              values={values}
              errors={fieldErrors}
              projects={projects}
              onChange={(key, value) => setValues((current) => ({ ...current, [key]: value }))}
            />
          </fieldset>
          <div className="mt-6 flex flex-wrap justify-end gap-3">
            <button
              type="button"
              className="cms-secondary"
              disabled={busy}
              onClick={close}
            >
              Cancel
            </button>
            <button className="admin-primary" disabled={busy}>
              <Save size={16} />
              {busy ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        </form>
      )}
      {loading ? (
        <StatePanel loading title={'Loading ' + config.title.toLowerCase()} />
      ) : !error || editor ? (
        records.length ? (
          <div className="cms-records">
            <table>
              <caption className="sr-only">{config.title}</caption>
              <thead>
                <tr>
                  {config.columns.map((column) => (
                    <th key={column}>{column}</th>
                  ))}
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {records.map((record) => (
                  <tr key={record._id}>
                    {config.columns.map((column) => (
                      <td key={column} data-label={column}>
                        {display(record[column])}
                      </td>
                    ))}
                    <td className="cms-record-actions">
                      <button disabled={busy} onClick={() => open(record)}>
                        Edit
                        <span className="sr-only">
                          {' '}
                          {record.title || record.label || record.name || record.key}
                        </span>
                      </button>
                      <button
                        className="cms-delete"
                        disabled={busy}
                        aria-label={
                          'Delete ' + (record.title || record.label || record.name || record.key)
                        }
                        onClick={() => remove(record)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <StatePanel
            title={'No ' + config.title.toLowerCase() + ' yet'}
            message={'Use Add ' + config.singular + ' to create your first entry.'}
          />
        )
      ) : null}
    </section>
  );
}
