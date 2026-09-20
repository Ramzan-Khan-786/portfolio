import { useEffect, useId, useRef, useState } from 'react';
import { uploadFile, uploadRules, validateFile } from '../../lib/media.js';
import './Media.css';
export default function MediaUploader({ category = 'misc', endpoint = 'media', fields = {}, onUploaded, disabled = false }) {
  const id = useId(), job = useRef(null), completed = useRef(onUploaded);
  completed.current = onUploaded;
  const [file, setFile] = useState(null), [preview, setPreview] = useState('');
  const [state, setState] = useState('idle'), [error, setError] = useState(''), [progress, setProgress] = useState(0);
  const busy = ['uploading', 'processing', 'validating'].includes(state);
  useEffect(() => {
    if (!file || !file.type.startsWith('image/')) { setPreview(''); return; }
    const url = URL.createObjectURL(file); setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);
  useEffect(() => () => job.current?.cancel(), []);
  function choose(selected) {
    setError(''); setState('validating');
    try { validateFile(selected, category); setFile(selected); setState('selected'); }
    catch (failure) { setFile(null); setError(failure.message); setState('error'); }
  }
  async function upload() {
    if (!file) return;
    setState('uploading'); setProgress(0); setError('');
    const operation = uploadFile(endpoint, file, endpoint === 'media' ? { category, ...fields } : fields, (value) => {
      setProgress(value); if (value === 100) setState('processing');
    });
    job.current = operation;
    try { const asset = await operation.promise; setState('uploaded'); setFile(null); completed.current?.(asset); }
    catch (failure) { setState('error'); setError(failure.message); }
    finally { job.current = null; }
  }
  return <div className="media-upload" aria-busy={busy}>
    <label htmlFor={id} className={'media-dropzone ' + (state === 'dragging' ? 'is-dragging' : '')}
      onDragOver={(event) => { event.preventDefault(); event.stopPropagation(); if (!busy && !disabled) setState('dragging'); }}
      onDragLeave={() => { if (!busy) setState(file ? 'selected' : 'idle'); }}
      onDrop={(event) => { event.preventDefault(); event.stopPropagation(); if (!busy && !disabled) { if (event.dataTransfer.files.length !== 1) { setError('Choose one file at a time.'); setState('error'); } else choose(event.dataTransfer.files[0]); } }}>
      <strong>{state === 'dragging' ? 'Drop the file here' : 'Drop a file or browse locally'}</strong>
      <span>{['resume', 'documents'].includes(category) ? 'PDF' : 'JPEG / PNG / WebP'} · up to {uploadRules(category).limit / 1048576} MB</span>
      <input id={id} type="file" accept={uploadRules(category).accept} disabled={busy || disabled}
        onChange={(event) => { if (event.target.files?.[0]) choose(event.target.files[0]); event.target.value = ''; }} />
    </label>
    {file && <div className="media-selected">
      {preview && <img src={preview} alt="Selected file preview" />}
      <div><strong>{file.name}</strong><p>{(file.size / 1024).toFixed(0)} KB · {file.type}</p></div>
    </div>}
    {busy && <div role="status"><progress className="progress progress-primary" value={progress} max="100" />
      <p>{state === 'processing' ? 'Validating and storing with Cloudinary…' : 'Uploading… ' + progress + '%'}</p></div>}
    {state === 'uploaded' && <p role="status" className="text-sm">{category === 'resume' ? 'Draft uploaded. Preview and publish it in Resume Management.' : 'Uploaded. Save the content field to publish its selection.'}</p>}
    {error && <p role="alert" className="cms-error">{error}</p>}
    <div className="flex flex-wrap gap-2">
      {file && !busy && <><button type="button" className="btn btn-primary btn-sm" onClick={upload} disabled={disabled}>Upload {category === 'resume' ? 'draft' : 'asset'}</button>
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => { setFile(null); setState('idle'); }}>Remove selection</button></>}
      {busy && <button type="button" className="btn btn-ghost btn-sm" onClick={() => job.current?.cancel()}>Cancel upload</button>}
    </div>
  </div>;
}
