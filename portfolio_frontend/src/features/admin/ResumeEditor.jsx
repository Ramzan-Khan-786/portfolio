import { useEffect, useRef, useState } from 'react';
import { apiClient, assetUrl } from '../../lib/api.js';
import { StatePanel } from '../../components/Ui.jsx';
import FormFields from './FormFields.jsx';
import { resumeFields } from './sectionConfig.js';
import { toForm, toPayload } from './config.js';
export default function ResumeEditor({ notify }) {
  const [record, setRecord] = useState(null),
    [values, setValues] = useState(null),
    [error, setError] = useState(''),
    [errors, setErrors] = useState({}),
    [busy, setBusy] = useState(false),
    [attempt, setAttempt] = useState(0);
  const fileRef = useRef();
  useEffect(() => {
    let active = true;
    setError('');
    apiClient
      .get('resume')
      .then((data) => {
        if (active) {
          setRecord(data);
          setValues(toForm(data, resumeFields));
        }
      })
      .catch((e) => {
        if (active) setError(e.message);
      });
    return () => {
      active = false;
    };
  }, [attempt]);
  async function save(event) {
    event.preventDefault();
    setBusy(true);
    setError('');
    setErrors({});
    try {
      const data = await apiClient.put('resume', toPayload(values, resumeFields));
      setRecord(data);
      notify('Resume settings saved.');
    } catch (e) {
      setError(e.message);
      setErrors(e.details?.fieldErrors || {});
    } finally {
      setBusy(false);
    }
  }
  async function detach() {
    if (
      !window.confirm(
        'Remove the current PDF from the public resume? The stored file is retained privately for recovery. An external URL, if configured, will become active.',
      )
    )
      return;
    setBusy(true);
    setError('');
    try {
      setRecord(await apiClient.detachResume());
      notify('Current PDF removed from the resume. Stored bytes were retained.');
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  async function upload(event) {
    event.preventDefault();
    const file = fileRef.current.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError('Choose a PDF under 5 MB.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const data = await apiClient.uploadResume(file);
      setRecord(data);
      setValues((old) => ({ ...old, lastUpdated: data.lastUpdated }));
      fileRef.current.value = '';
      notify('Resume PDF uploaded.');
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <section>
      <div className="cms-page-heading">
        <div>
          <p className="eyebrow">Portfolio / document</p>
          <h1>Resume</h1>
          <p>
            Education, experience, achievements, skills, and projects are reused from their own
            modules.
          </p>
        </div>
      </div>
      {error && (
        <p className="cms-error" role="alert">
          {error}
        </p>
      )}
      {values ? (
        <>
          <form onSubmit={save} className="cms-editor">
            <fieldset disabled={busy}>
              <FormFields
                fields={resumeFields}
                values={values}
                errors={errors}
                onChange={(name, value) => setValues({ ...values, [name]: value })}
              />
            </fieldset>
            <button className="admin-primary mt-6" disabled={busy}>
              {busy ? 'Working…' : 'Save resume settings'}
            </button>
          </form>
          <form onSubmit={upload} className="cms-editor mt-6">
            <h2 className="text-lg mb-2">Resume PDF</h2>
            {record.hasFile && (
              <button type="button" className="cms-secondary mb-4" onClick={detach} disabled={busy}>
                Remove current PDF
              </button>
            )}
            <p className="text-sm text-secondary mb-4">
              {record.hasFile
                ? 'A PDF is stored. Uploading another replaces the public version; older files are retained privately for recovery.'
                : 'No PDF uploaded yet.'}
            </p>
            {record.hasFile && record.visible && (
              <a
                className="text-accent underline block mb-4"
                href={assetUrl('/public/resume/file')}
                target="_blank"
                rel="noopener noreferrer"
              >
                View current PDF ↗
              </a>
            )}
            <label className="cms-field">
              PDF file
              <input
                ref={fileRef}
                type="file"
                accept=".pdf,application/pdf"
                required
                disabled={busy}
              />
              <small>
                Maximum 5 MB, 1–50 pages, unencrypted; no scripts or attachments. Only upload
                documents you trust. Disabling the download button cannot prevent saving a viewable
                PDF.
              </small>
            </label>
            <button className="admin-primary mt-4" disabled={busy}>
              {busy ? 'Working…' : 'Upload PDF'}
            </button>
          </form>
        </>
      ) : (
        <StatePanel
          loading={!error}
          title={error ? 'Unable to load resume' : 'Loading resume'}
          retry={error ? () => setAttempt(attempt + 1) : undefined}
        />
      )}
    </section>
  );
}
