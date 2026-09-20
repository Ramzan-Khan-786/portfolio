import { lazy, Suspense, useEffect, useId, useState } from 'react';
import { apiClient, assetUrl } from '../../lib/api.js';
import { mediaCategories } from '../../lib/media.js';
import { StatePanel } from '../../components/Ui.jsx';
import MediaUploader from './MediaUploader.jsx';
import './Media.css';
const ResumeViewer = lazy(() => import('../../components/ResumeViewer.jsx'));
export default function MediaLibrary({ onSelect, assetType = '', initialCategory = '', notify = () => {} }) {
  const prefix = useId();
  const [category, setCategory] = useState(initialCategory), [type, setType] = useState(assetType);
  const [query, setQuery] = useState(''), [search, setSearch] = useState(''), [sort, setSort] = useState('recent');
  const [page, setPage] = useState(1), [attempt, setAttempt] = useState(0), [data, setData] = useState(null);
  const [error, setError] = useState(''), [busy, setBusy] = useState(false), [detail, setDetail] = useState(null), [config, setConfig] = useState(null);
  const [configError, setConfigError] = useState('');
  const [feedback, setFeedback] = useState('');
  const announce = (message) => { setFeedback(message); notify(message); };
  useEffect(() => {
    let active = true;
    apiClient.get('media/config').then((result) => { if (active) { setConfig(result); setConfigError(''); } }).catch((e) => { if (active) setConfigError(e.message); });
    return () => { active = false; };
  }, [attempt]);
  useEffect(() => {
    const timer = setTimeout(() => { setSearch(query); setPage(1); }, 300);
    return () => clearTimeout(timer);
  }, [query]);
  useEffect(() => {
    let active = true; setData(null); setError('');
    const params = new URLSearchParams({ page, category, type, q: search, sort });
    apiClient.get('media?' + params).then((result) => { if (active) setData(result); }).catch((e) => { if (active) setError(e.message); });
    return () => { active = false; };
  }, [page, category, type, search, sort, attempt]);
  useEffect(() => { if (data && page > data.pages) setPage(data.pages); }, [data, page]);
  const refresh = () => setAttempt((value) => value + 1);
  async function inspect(asset) {
    setError(''); setBusy(true);
    try { setDetail(await apiClient.get('media/' + asset._id)); } catch (e) { setError(e.message); } finally { setBusy(false); }
  }
  async function remove(asset) {
    setError(''); setBusy(true);
    try {
      const current = await apiClient.get('media/' + asset._id);
      setDetail(current);
      if (current.usage.length) throw new Error('This asset is in use: ' + current.usage.map((item) => item.label).join(', ') + '. Remove those references first.');
      if (!window.confirm('Permanently delete "' + asset.displayName + '" from Cloudinary and the library? This cannot be undone.')) return;
      await apiClient.deleteConfirmed('media/' + asset._id);
      setDetail(null); refresh(); announce('Unused asset permanently deleted.');
    } catch (e) { setError(e.message); } finally { setBusy(false); }
  }
  async function saveMetadata() {
    setBusy(true); setError('');
    try {
      const { displayName, altText, caption } = detail;
      const tags = detail.tagsText === undefined ? detail.tags : detail.tagsText.split(',').map((tag) => tag.trim()).filter(Boolean);
      await apiClient.put('media/' + detail._id, { displayName, altText, caption, tags });
      announce('Media metadata saved.'); refresh();
    } catch (e) { setError(e.message); } finally { setBusy(false); }
  }
  async function background() {
    if (!window.confirm('Request a separate background-removed icon? Cloudinary transformation charges may apply.')) return;
    setBusy(true); setError('');
    try {
      const processed = await apiClient.post('media/' + detail._id + '/remove-background', {}, 120000);
      setDetail({ ...processed, usage: [] }); refresh(); announce('Processed icon created. Select it and save the content to use it.');
    } catch (e) { setError(e.message); } finally { setBusy(false); }
  }
  return <section className="media-library">
    {!onSelect && <div className="cms-page-heading"><div><p className="eyebrow">Workspace / media</p><h1>Media library</h1><p>Upload once, reuse across the portfolio. Selecting a replacement never deletes the original.</p></div></div>}
    {feedback && <p className="text-sm mb-3" role="status">{feedback}</p>}
    {configError && <p className="cms-error" role="alert">Media configuration could not load: {configError}<button type="button" className="underline ml-3" onClick={refresh}>Retry configuration</button></p>}
    {config && !config.configured && <p className="cms-error">Cloudinary is not configured. Add the backend credentials to enable uploads and delivery.</p>}
    {!onSelect && <details className="cms-editor mb-4"><summary>Upload an asset</summary><label className="cms-field mt-4">Upload category
      <select value={category || 'misc'} onChange={(e) => { setCategory(e.target.value); setPage(1); }}>
        {mediaCategories.map((key) => <option key={key}>{key}</option>)}</select></label>
      <MediaUploader category={category || 'misc'} disabled={!config?.configured} onUploaded={() => { refresh(); announce('Media uploaded.'); }} />
      <p className="text-xs text-muted mt-3">Use Resume Management for versioned resume uploads. Other documents stay private.</p></details>}
    <div className="media-filters">
      <label className="cms-field">Search<input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Name, alt text or tag" /></label>
      <label className="cms-field">Category<select value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); }}><option value="">All categories</option>{[...mediaCategories, 'resume'].map((key) => <option key={key}>{key}</option>)}</select></label>
      {!assetType && <label className="cms-field">Type<select value={type} onChange={(e) => { setType(e.target.value); setPage(1); }}><option value="">All media</option><option value="image">Images</option><option value="document">Documents</option></select></label>}
      <label className="cms-field">Sort<select value={sort} onChange={(e) => { setSort(e.target.value); setPage(1); }}><option value="recent">Newest first</option><option value="name">Name</option></select></label>
    </div>
    {error && <p className="cms-error" role="alert">{error}<button type="button" className="underline ml-3" onClick={refresh}>Reload</button></p>}
    {detail && <div className="media-detail cms-editor">
      <div className="flex justify-between gap-3"><h2>Asset details</h2><button type="button" className="btn btn-ghost btn-sm" onClick={() => setDetail(null)}>Close details</button></div>
      {detail.url && <img src={detail.url} className="media-detail-preview" alt={detail.altText || detail.displayName} />}
      {detail.assetType === 'document' && detail.status === 'ready' && <Suspense fallback={<StatePanel loading title="Opening document" />}><ResumeViewer url={assetUrl('/admin/media/' + detail._id + '/file')} /></Suspense>}
      <dl className="media-metadata"><dt>Cloudinary ID</dt><dd>{detail.publicId}</dd><dt>File</dt><dd>{detail.originalFilename} · {Math.round(detail.bytes / 1024)} KB</dd><dt>Dimensions</dt><dd>{detail.width ? detail.width + ' × ' + detail.height : 'PDF document'}</dd><dt>Status</dt><dd>{detail.status}</dd><dt>Used by</dt><dd>{detail.usage?.map((item) => item.kind + ': ' + item.label).join('; ') || 'No content references'}</dd></dl>
      <fieldset disabled={busy}>
        {[['displayName', 'Display name'], ['altText', 'Alternative text'], ['caption', 'Caption']].map(([name, label]) => <label className="cms-field" key={name} htmlFor={prefix + name}>{label}<input id={prefix + name} value={detail[name] || ''} maxLength={name === 'displayName' ? 160 : name === 'altText' ? 300 : 600} onChange={(e) => setDetail({ ...detail, [name]: e.target.value })} /></label>)}
        <label className="cms-field">Tags (comma-separated)<input value={detail.tagsText ?? (detail.tags || []).join(', ')} onChange={(e) => setDetail({ ...detail, tagsText: e.target.value })} /></label>
        <div className="flex flex-wrap gap-2 mt-4">
          <button type="button" className="btn btn-primary btn-sm" onClick={saveMetadata}>Save metadata</button>
          {onSelect && detail.status === 'ready' && <button type="button" className="btn btn-sm" onClick={() => onSelect(detail)}>Select asset</button>}
          {detail.url && <button type="button" className="btn btn-sm" onClick={() => navigator.clipboard.writeText(detail.url).then(() => announce('Delivery URL copied.')).catch(() => setError('Clipboard unavailable. Copy the Cloudinary ID from details.'))}>Copy URL</button>}
          <button type="button" className="btn btn-outline btn-error btn-sm" onClick={() => remove(detail)}>Delete permanently</button>
          {['skills', 'tech-stack'].includes(detail.category) && <button type="button" className="btn btn-sm" disabled={!config?.backgroundRemoval} onClick={background}>Remove background</button>}
        </div>
      </fieldset>
      {detail.category !== 'resume' && <details className="mt-4"><summary>Upload a replacement asset</summary><p className="text-xs text-muted my-2">Creates a new asset. Re-select it in the relevant content editor; existing references and the old file stay intact until you save.</p><MediaUploader category={detail.category} onUploaded={(asset) => { setDetail({ ...asset, usage: [] }); refresh(); }} /></details>}
      {['skills', 'tech-stack'].includes(detail.category) && <p className="text-xs text-muted mt-3">{config?.backgroundRemoval ? 'Optional account-dependent processing. The original remains unchanged.' : 'Automatic background removal is unavailable. Upload a transparent PNG or WebP.'}</p>}
    </div>}
    {!data && !error ? <StatePanel loading title="Loading media" /> : data?.items.length ? <div className="media-grid">
      {data.items.map((asset) => <article className="media-card" key={asset._id}>
        <button type="button" className="media-card-preview" onClick={() => inspect(asset)} disabled={busy}>
          {asset.url ? <img src={asset.url} alt={asset.altText || asset.displayName} loading="lazy" /> : <span>{asset.assetType === 'document' ? 'PDF / PRIVATE' : asset.status}</span>}
        </button>
        <strong>{asset.displayName}</strong><p>{asset.category} · {Math.round(asset.bytes / 1024)} KB</p>
        <div className="flex flex-wrap gap-2">
          {onSelect && <button type="button" disabled={asset.status !== 'ready'} className="btn btn-primary btn-xs" onClick={() => onSelect(asset)}>Select</button>}
          <button type="button" className="btn btn-ghost btn-xs" onClick={() => inspect(asset)}>Details / manage</button>
        </div>
      </article>)}
    </div> : data && <StatePanel title="No media found" message="Upload a file or change these filters." />}
    {data && <div className="media-pagination"><button type="button" className="btn btn-sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</button><span>Page {page} / {data.pages} · {data.total} assets</span><button type="button" className="btn btn-sm" disabled={page >= data.pages} onClick={() => setPage(page + 1)}>Next</button></div>}
  </section>;
}
