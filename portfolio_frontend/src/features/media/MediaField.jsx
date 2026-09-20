import { useEffect, useId, useRef, useState } from 'react';
import { mediaSelection } from '../../lib/media.js';
import MediaUploader from './MediaUploader.jsx';
import MediaLibrary from './MediaLibrary.jsx';
export function MediaPicker({ onSelect, onClose, assetType = 'image', category = '' }) {
  const dialog = useRef(null), heading = useId();
  useEffect(() => { const node = dialog.current; node.showModal(); return () => node.close(); }, []);
  return <dialog ref={dialog} className="media-dialog" aria-labelledby={heading} onCancel={(event) => { event.preventDefault(); onClose(); }}>
    <div className="media-dialog-heading"><h2 id={heading}>Choose existing media</h2><button type="button" className="btn btn-sm" onClick={onClose}>Close library</button></div>
    <MediaLibrary onSelect={onSelect} assetType={assetType} initialCategory={category} />
  </dialog>;
}
export default function MediaField({ label, value, onChange, category = 'misc', projectSlug }) {
  const [picker, setPicker] = useState(false), [upload, setUpload] = useState(false);
  function select(asset) { onChange(mediaSelection(asset)); setPicker(false); setUpload(false); }
  return <fieldset className="media-field"><legend>{label}</legend>
    {value?.mediaId ? <div className="media-field-current">
      {value.url ? <img src={value.url} alt={value.altText || label} /> : <span>Selected media · {value.mediaId}</span>}
      <div className="grid gap-3 min-w-0">
        <label className="cms-field">Alternative text<input value={value.altText || ''} maxLength={300} onChange={(e) => onChange({ ...value, altText: e.target.value })} /></label>
        <label className="cms-field">Caption<input value={value.caption || ''} maxLength={600} onChange={(e) => onChange({ ...value, caption: e.target.value })} /></label>
      </div>
    </div> : <p className="text-xs text-muted">No managed image selected. Existing legacy URLs remain supported.</p>}
    <div className="flex flex-wrap gap-2 mt-3">
      <button type="button" className="btn btn-sm" onClick={() => setUpload(!upload)}>{value ? 'Upload replacement' : 'Upload image'}</button>
      <button type="button" className="btn btn-sm btn-outline" onClick={() => setPicker(true)}>Choose from library</button>
      {value && <button type="button" className="btn btn-ghost btn-sm" onClick={() => onChange(null)}>Remove selection</button>}
    </div>
    {upload && <MediaUploader category={category} fields={projectSlug ? { projectSlug } : {}} onUploaded={select} />}
    <p className="text-xs text-muted mt-3">Save this editor to apply changes. Removing a selection does not delete the stored asset.</p>
    {picker && <MediaPicker category={category} onSelect={select} onClose={() => setPicker(false)} />}
  </fieldset>;
}
export function MediaGallery({ label, value = [], onChange, category = 'projects', projectSlug, max = 8 }) {
  const drag = useRef(null);
  function move(from, to) {
    if (from === null || to < 0 || to >= value.length) return;
    const next = [...value], [entry] = next.splice(from, 1); next.splice(to, 0, entry); onChange(next); drag.current = null;
  }
  return <fieldset className="media-gallery"><legend>{label} · {value.length}/{max}</legend>
    {value.map((entry, index) => <div key={entry.mediaId + '-' + index} className="media-gallery-row"
      onDragOver={(event) => { if (drag.current !== null) event.preventDefault(); }}
      onDrop={(event) => { if (drag.current !== null) { event.preventDefault(); move(drag.current, index); } }}>
      <div className="flex flex-wrap gap-2 mb-2"><button type="button" draggable className="btn btn-xs" onDragStart={() => { drag.current = index; }} onDragEnd={() => { drag.current = null; }}>Drag image {index + 1}</button>
        <button type="button" className="btn btn-xs" disabled={!index} onClick={() => move(index, index - 1)}>Move up</button>
        <button type="button" className="btn btn-xs" disabled={index === value.length - 1} onClick={() => move(index, index + 1)}>Move down</button></div>
      <MediaField label={'Image ' + (index + 1)} value={entry} category={category} projectSlug={projectSlug} onChange={(next) => onChange(next ? value.map((item, i) => i === index ? next : item) : value.filter((_, i) => i !== index))} />
    </div>)}
    {value.length < max && <MediaField label="Add gallery image" category={category} projectSlug={projectSlug} value={null} onChange={(entry) => { if (entry) onChange([...value, entry]); }} />}
  </fieldset>;
}
