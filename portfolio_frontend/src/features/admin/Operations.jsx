import { useEffect, useState } from 'react';
import { apiClient } from '../../lib/api.js';
import { StatePanel } from '../../components/Ui.jsx';
export default function Operations() {
  const [data, setData] = useState(null),
    [error, setError] = useState(''),
    [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    setError('');
    apiClient
      .get('operations')
      .then((v) => {
        if (active) setData(v);
      })
      .catch((e) => {
        if (active) setError(e.message);
      });
    return () => {
      active = false;
    };
  }, [attempt]);
  return (
    <section>
      <div className="cms-page-heading">
        <div>
          <p className="eyebrow">System / operations</p>
          <h1>Service status</h1>
          <p>
            Current process information and a redacted event window. Full rotated logs remain on the
            server.
          </p>
        </div>
        <button className="cms-secondary" onClick={() => setAttempt(attempt + 1)}>
          Refresh
        </button>
      </div>
      {error ? (
        <StatePanel
          title="Status unavailable"
          message={error}
          retry={() => setAttempt(attempt + 1)}
        />
      ) : !data ? (
        <StatePanel loading title="Loading service status" />
      ) : (
        <>
          <dl className="cms-editor grid gap-5 sm:grid-cols-2">
            {[
              ['Database', data.database],
              [
                'Google sign-in',
                data.googleConfigured
                  ? 'Configured; verify your authorized origins'
                  : 'Not configured',
              ],
              ['File logging', data.fileLogging ? 'Enabled' : 'Disabled in test mode'],
              ['Process uptime', data.uptimeSeconds + ' seconds'],
              ['Rotation', data.rotation],
              ['Log files', data.logFiles.join(', ')],
            ].map(([k, v]) => (
              <div key={k}>
                <dt className="text-xs text-muted mb-2">{k}</dt>
                <dd className="text-sm break-words">{v}</dd>
              </div>
            ))}
          </dl>
          <div className="cms-editor">
            <h2 className="text-lg mb-4">Recent process events</h2>
            <p className="text-xs text-muted mb-4">
              Last 50 application, authentication, and admin events since this process started. No
              request bodies, passwords, tokens, email addresses, or query strings.
            </p>
            {data.recentEvents.length ? (
              <ol className="divide-y divide-line">
                {data.recentEvents.map((event, index) => (
                  <li key={index} className="py-3 flex flex-wrap gap-3 font-mono text-xs">
                    <time>{new Date(event.timestamp).toLocaleString()}</time>
                    <span>{event.event}</span>
                    {event.status && <span>HTTP {event.status}</span>}
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-sm text-muted">No events in this process yet.</p>
            )}
          </div>
        </>
      )}
    </section>
  );
}
