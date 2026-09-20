import { useEffect, useState } from 'react';
import { apiClient } from '../../lib/api.js';
const scripts = new Map();
function script(src) {
  if (!scripts.has(src)) scripts.set(src, new Promise((resolve, reject) => {
    const node = document.createElement('script'); node.src = src; node.async = true;
    node.onload = resolve; node.onerror = () => { scripts.delete(src); node.remove(); reject(new Error('Google could not load. Check the connection or use local upload.')); };
    document.head.appendChild(node);
  }));
  return scripts.get(src);
}
export default function GoogleDriveImport({ config, onImported, disabled = false }) {
  const [busy, setBusy] = useState(false), [error, setError] = useState(''), [ready, setReady] = useState(false);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    if (!config?.enabled) return undefined;
    let active = true;
    setReady(false); setError('');
    Promise.all([script('https://accounts.google.com/gsi/client'), script('https://apis.google.com/js/api.js')])
      .then(() => new Promise((resolve, reject) => window.gapi.load('picker', { callback: resolve, onerror: () => reject(new Error('Drive picker unavailable.')), timeout: 15000, ontimeout: () => reject(new Error('Drive picker timed out.')) })))
      .then(() => { if (active) setReady(true); }).catch((e) => { if (active) setError(e.message); });
    return () => { active = false; };
  }, [config?.enabled, attempt]);
  function choose() {
    setBusy(true); setError('');
    try {
      const token = window.google.accounts.oauth2.initTokenClient({
        client_id: config.clientId, scope: 'https://www.googleapis.com/auth/drive.file',
        error_callback: () => { setBusy(false); setError('Google authorization was cancelled or blocked.'); },
        callback: (result) => {
          if (!result.access_token || !window.google.accounts.oauth2.hasGrantedAllScopes(result, 'https://www.googleapis.com/auth/drive.file')) { setBusy(false); setError('Drive access was not granted.'); return; }
          let accessToken = result.access_token;
          try {
          const view = new window.google.picker.DocsView().setMimeTypes('application/pdf').setIncludeFolders(true).setSelectFolderEnabled(false);
          const picker = new window.google.picker.PickerBuilder().addView(view).setOAuthToken(accessToken)
            .setDeveloperKey(config.apiKey).setAppId(config.appId).setOrigin(window.location.origin)
            .setCallback(async (data) => {
              if (data.action === window.google.picker.Action.CANCEL) { accessToken = ''; setBusy(false); }
              if (data.action !== window.google.picker.Action.PICKED) return;
              picker.setVisible(false);
              try { const row = await apiClient.post('resumes/import-drive', { fileId: data.docs[0].id, accessToken }, 120000); onImported(row); }
              catch (e) { setError(e.message); }
              finally { accessToken = ''; setBusy(false); }
            }).build();
          picker.setVisible(true);
          } catch { accessToken = ''; setBusy(false); setError('The Drive picker could not open. Retry or upload the PDF locally.'); }
        },
      });
      token.requestAccessToken({ prompt: 'consent' });
    } catch (e) { setError(e.message); setBusy(false); }
  }
  return <div className="my-4">
    <button type="button" className="btn btn-sm btn-outline" disabled={disabled || busy || !config?.enabled || !ready} onClick={choose}>{busy ? 'Importing from Drive…' : config?.enabled && !ready ? 'Loading Drive picker…' : 'Import from Google Drive'}</button>
    <p className="text-xs text-muted mt-2">{config?.enabled ? 'Choose one PDF. Drive is only the source; the imported draft is stored privately in Cloudinary.' : 'Drive import is not configured. Download your PDF from Drive, then upload it locally.'}</p>
    {error && <p className="cms-error" role="alert">{error}{!ready && config?.enabled && <button type="button" className="underline ml-3" onClick={() => setAttempt((value) => value + 1)}>Retry Drive setup</button>}</p>}
  </div>;
}
