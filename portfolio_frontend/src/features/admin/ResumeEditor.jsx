import { lazy, Suspense, useEffect, useState } from 'react';
import { apiClient, assetUrl } from '../../lib/api.js';
import { StatePanel } from '../../components/Ui.jsx';
import { usePortfolio } from '../../context/PortfolioContext.jsx';
import MediaUploader from '../media/MediaUploader.jsx';
import { MediaPicker } from '../media/MediaField.jsx';
import GoogleDriveImport from './GoogleDriveImport.jsx';
import FormFields from './FormFields.jsx';
import { resumeFields } from './sectionConfig.js';
import { toForm, toPayload } from './config.js';
import useUnsavedChanges from '../../hooks/useUnsavedChanges.js';
const ResumeViewer = lazy(() => import('../../components/ResumeViewer.jsx'));
export default function ResumeEditor({ notify }) {
  const { refresh } = usePortfolio();
  const [values, setValues] = useState(null), [config, setConfig] = useState(null), [data, setData] = useState(null);
  const [page, setPage] = useState(1), [attempt, setAttempt] = useState(0), [error, setError] = useState(''), [busy, setBusy] = useState(false);
  const [readyId, setReadyId] = useState(null);
  const [configurationAttempt, setConfigurationAttempt] = useState(0);
  const [preview, setPreview] = useState(null), [picker, setPicker] = useState(false), [metadata, setMetadata] = useState(null);
  const { dirty, markSaved } = useUnsavedChanges(values);
  useEffect(() => {
    let active = true;
    Promise.all([apiClient.get('resume'), apiClient.get('media/config')]).then(([settings, capability]) => {
      if (active) { const value = toForm(settings, resumeFields); setValues(value); markSaved(value); setConfig(capability); }
    }).catch((e) => { if (active) setError(e.message); });
    return () => { active = false; };
  }, [markSaved, configurationAttempt]);
  useEffect(() => {
    let active = true; setData(null);
    apiClient.get('resumes?page=' + page).then((result) => { if (active) setData(result); }).catch((e) => { if (active) setError(e.message); });
    return () => { active = false; };
  }, [page, attempt]);
  useEffect(() => { if (data && page > data.pages) setPage(data.pages); }, [data, page]);
  function reload() { setAttempt((value) => value + 1); }
  function uploaded(row) { setPage(1); reload(); setPreview(row); setMetadata({ title: row.title, description: row.description }); notify('Resume v' + row.version + ' saved as a draft. Review it before publishing.'); }
  async function action(row, operation) {
    if (operation === 'publish' && !window.confirm('Publish Resume v' + row.version + '? The previous published version will be archived.')) return;
    if (operation === 'archive' && !window.confirm('Archive Resume v' + row.version + '? If currently published, it will no longer be publicly available.')) return;
    if (operation === 'delete' && !window.confirm('Permanently delete Resume v' + row.version + ' and its Cloudinary PDF? This cannot be undone.')) return;
    setBusy(true); setError('');
    try {
      if (operation === 'delete') { await apiClient.deleteConfirmed('resumes/' + row._id); if (preview?._id === row._id) setPreview(null); }
      else await apiClient.post('resumes/' + row._id + '/' + operation);
      reload(); refresh(); notify('Resume ' + (operation === 'delete' ? 'permanently deleted.' : operation === 'publish' ? 'published.' : 'archived.'));
    } catch (e) { setError(e.message); } finally { setBusy(false); }
  }
  async function save(event) {
    event.preventDefault(); setBusy(true); setError('');
    try { await apiClient.put('resume', toPayload(values, resumeFields)); markSaved(values); notify('Resume page settings saved.'); refresh(); }
    catch (e) { setError(e.message); } finally { setBusy(false); }
  }
  async function markReviewed(id) {
    try { await apiClient.post('resumes/' + id + '/previewed'); reload(); }
    catch (e) { setError('Preview opened, but acknowledgement failed: ' + e.message); }
  }
  async function saveMetadata() {
    setBusy(true); setError('');
    try { const row = await apiClient.put('resumes/' + preview._id, metadata); setPreview(row); reload(); refresh(); notify('Version details saved.'); }
    catch (e) { setError(e.message); } finally { setBusy(false); }
  }
  return <section>
    <div className="cms-page-heading"><div><p className="eyebrow">Content / documents</p><h1>Resume management</h1><p>Cloudinary-backed drafts, preview, publication and rollback. Uploading never publishes automatically.</p></div></div>
    {error && <p className="cms-error" role="alert">{error}<button type="button" className="underline ml-3" onClick={() => { setError(''); reload(); }}>Reload versions</button></p>}
    {(!values || !config) && error && <button type="button" className="btn btn-sm mb-4" onClick={() => { setError(''); setConfigurationAttempt((value) => value + 1); }}>Retry resume configuration</button>}
    <div className="cms-editor mb-6">
      <h2 className="text-lg">Create a resume draft</h2>
      {config && !config.configured && <p className="cms-error">Configure Cloudinary backend credentials first. Legacy files remain read-only.</p>}
      <MediaUploader category="resume" endpoint="resumes" disabled={busy || !config?.configured} onUploaded={uploaded} />
      <GoogleDriveImport config={config?.drive} disabled={busy || !config?.configured} onImported={uploaded} />
      <button type="button" className="btn btn-sm btn-outline" disabled={busy || !config?.configured} onClick={() => setPicker(true)}>Use a PDF from the media library</button>
      {picker && <MediaPicker assetType="document" onClose={() => setPicker(false)} onSelect={async (asset) => {
        setPicker(false); setBusy(true); setError('');
        try { uploaded(await apiClient.post('resumes/from-library', { mediaId: asset._id }, 120000)); }
        catch (e) { setError(e.message); } finally { setBusy(false); }
      }} />}
    </div>
    {preview && <div className="cms-editor mb-6">
      <div className="flex items-center justify-between gap-3 mb-4"><h2>Preview · Resume v{preview.version}</h2><button type="button" className="btn btn-sm" onClick={() => setPreview(null)}>Close preview</button></div>
      <div className="grid gap-3 mb-4 sm:grid-cols-2">
        <label className="cms-field">Version title<input value={metadata?.title || ''} maxLength={120} onChange={(e) => setMetadata({ ...metadata, title: e.target.value })} /></label>
        <label className="cms-field">Version description<input value={metadata?.description || ''} maxLength={600} onChange={(e) => setMetadata({ ...metadata, description: e.target.value })} /></label>
      </div>
      <button type="button" className="btn btn-sm mb-4" disabled={busy || !metadata?.title?.trim()} onClick={saveMetadata}>Save version details</button>
      <button type="button" className="btn btn-sm mb-4 ml-2" disabled={readyId !== preview._id} onClick={() => markReviewed(preview._id)}>Confirm preview reviewed / retry acknowledgement</button>
      <Suspense fallback={<StatePanel loading title="Opening PDF viewer" />}><ResumeViewer key={preview._id} url={assetUrl('/admin/resumes/' + preview._id + '/file')} downloadUrl={assetUrl('/admin/resumes/' + preview._id + '/file?download=1')} onReady={() => { setReadyId(preview._id); markReviewed(preview._id); }} /></Suspense>
    </div>}
    {!data ? <StatePanel loading={!error} title={error ? 'Resume versions unavailable' : 'Loading resume versions'} retry={error ? () => { setError(''); reload(); } : undefined} /> : <div className="cms-records mb-6">
      <table><caption className="sr-only">Resume version history</caption><thead><tr><th>Version</th><th>Document</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody>{data.items.map((row) => <tr key={row._id}>
          <td data-label="Version">v{row.version}</td><td data-label="Document">{row.title}<small className="block text-xs text-muted">{row.pageCount} pages · {Math.round(row.fileSize / 1024)} KB · {row.source}</small></td>
          <td data-label="Status">{row.status}</td><td className="cms-record-actions">
            <button type="button" disabled={busy} onClick={() => { setPreview(row); setMetadata({ title: row.title, description: row.description }); }}>Preview</button>
            <button type="button" disabled={busy || row.status === 'published' || !row.previewedAt} title={!row.previewedAt ? 'Preview this PDF first' : 'Publish or restore this version'} onClick={() => action(row, 'publish')}>{row.status === 'archived' ? 'Restore / publish' : 'Publish'}</button>
            <button type="button" disabled={busy || row.status === 'archived'} onClick={() => action(row, 'archive')}>Archive</button>
            <button type="button" className="cms-delete" disabled={busy || row.status === 'published'} onClick={() => action(row, 'delete')}>Delete permanently</button>
          </td></tr>)}</tbody></table>
      {!data.items.length && <p className="p-5 text-sm text-muted">No Cloudinary resume versions yet. Upload the original PDF to begin.</p>}
      <div className="media-pagination p-4"><button type="button" className="btn btn-sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</button><span>Page {page} / {data.pages}</span><button type="button" className="btn btn-sm" disabled={page >= data.pages} onClick={() => setPage(page + 1)}>Next</button></div>
    </div>}
    {values && <form className="cms-editor" onSubmit={save}><h2 className="text-lg mb-4">Public resume page settings</h2><fieldset disabled={busy}>
      <FormFields fields={resumeFields} values={values} onChange={(name, value) => setValues((current) => ({ ...current, [name]: value }))} />
      <button className="btn btn-primary mt-5" disabled={busy}>{busy ? 'Saving…' : 'Save resume settings'}</button>{dirty && <span className="text-xs text-muted ml-3">Unsaved changes</span>}
    </fieldset></form>}
  </section>;
}
