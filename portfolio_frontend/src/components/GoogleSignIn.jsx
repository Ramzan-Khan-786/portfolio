import { useEffect, useRef, useState } from 'react';
import { apiClient } from '../lib/api.js';
let scriptPromise;
function loadGoogle() {
  if (window.google?.accounts?.id) return Promise.resolve();
  if (!scriptPromise)
    scriptPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      const timer = setTimeout(
        () => reject(new Error('Google sign-in took too long to load.')),
        12000,
      );
      script.onload = () => {
        clearTimeout(timer);
        resolve();
      };
      script.onerror = () => {
        clearTimeout(timer);
        script.remove();
        reject(
          new Error('Google sign-in could not load. Check your connection or content blocker.'),
        );
      };
      document.head.appendChild(script);
    }).catch((e) => {
      scriptPromise = null;
      throw e;
    });
  return scriptPromise;
}
export default function GoogleSignIn({ onResult }) {
  const host = useRef(null),
    callback = useRef(onResult);
  callback.current = onResult;
  const [message, setMessage] = useState('Loading Google sign-in…'),
    [error, setError] = useState(false),
    [attempt, setAttempt] = useState(0),
    [busy, setBusy] = useState(false);
  useEffect(() => {
    let active = true;
    setMessage('Loading Google sign-in…');
    setError(false);
    async function start() {
      try {
        const config = await apiClient.googleChallenge();
        if (!active) return;
        if (!config.configured) {
          setMessage(
            'Google sign-in is not configured on this portfolio yet. Email signup and login are available.',
          );
          return;
        }
        await loadGoogle();
        if (!active) return;
        window.google.accounts.id.initialize({
          client_id: config.clientId,
          nonce: config.nonce,
          auto_select: false,
          callback: async (response) => {
            if (!active) return;
            setBusy(true);
            setError(false);
            try {
              const result = await apiClient.google(response.credential);
              if (active) callback.current(result);
            } catch (e) {
              if (active) {
                setMessage(e.message);
                setError(true);
              }
            } finally {
              if (active) setBusy(false);
            }
          },
        });
        host.current.replaceChildren();
        window.google.accounts.id.renderButton(host.current, {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          text: 'continue_with',
          shape: 'rectangular',
          width: Math.min(320, host.current.clientWidth || 280),
        });
        setMessage('');
      } catch (e) {
        if (active) {
          setMessage(e.message);
          setError(true);
        }
      }
    }
    start();
    return () => {
      active = false;
      window.google?.accounts?.id?.cancel();
    };
  }, [attempt]);
  return (
    <div className="google-signin">
      <div ref={host} aria-label="Google sign-in" inert={busy ? '' : undefined} />
      {busy && <p role="status">Verifying Google identity…</p>}
      {message && <p role={error ? 'alert' : 'status'}>{message}</p>}
      {error && (
        <button
          type="button"
          className="secondary-action mt-3"
          onClick={() => setAttempt(attempt + 1)}
        >
          Retry Google sign-in
        </button>
      )}
    </div>
  );
}
