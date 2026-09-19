import { useEffect, useState } from 'react';
import { apiClient } from '../../lib/api.js';
import { StatePanel } from '../../components/Ui.jsx';
import './ResourceManager.css';
export default function UsersPanel({ notify }) {
  const [data, setData] = useState(null),
    [error, setError] = useState(''),
    [page, setPage] = useState(1),
    [attempt, setAttempt] = useState(0),
    [busy, setBusy] = useState(false);
  useEffect(() => {
    let active = true;
    setError('');
    apiClient
      .get('users?page=' + page)
      .then((v) => {
        if (active) setData(v);
      })
      .catch((e) => {
        if (active) setError(e.message);
      });
    return () => {
      active = false;
    };
  }, [page, attempt]);
  async function toggle(user) {
    if (
      !window.confirm(
        (user.disabled ? 'Restore' : 'Suspend') +
          ' access for ' +
          user.name +
          '? Existing sessions will be revoked.',
      )
    )
      return;
    setBusy(true);
    setError('');
    try {
      await apiClient.put('users/' + user._id, { disabled: !user.disabled });
      notify('Account access updated.');
      setAttempt(attempt + 1);
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
          <p className="eyebrow">Accounts / access</p>
          <h1>Users</h1>
          <p>
            Normal accounts can be suspended or restored. Administrator roles and credentials cannot
            be changed here.
          </p>
        </div>
      </div>
      {error && (
        <p className="cms-error" role="alert">
          {error}
          <button className="underline ml-3" onClick={() => setAttempt(attempt + 1)}>
            Retry
          </button>
        </p>
      )}
      {data ? (
        <>
          <p className="text-sm text-muted mb-4">{data.total} accounts</p>
          <div className="cms-records">
            <table>
              <caption className="sr-only">Registered accounts</caption>
              <thead>
                <tr>
                  {['Name', 'Email', 'Role', 'Providers', 'Access'].map((v) => (
                    <th key={v}>{v}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.items.map((u) => (
                  <tr key={u._id}>
                    <td data-label="Name">{u.name}</td>
                    <td data-label="Email">{u.email}</td>
                    <td data-label="Role">{u.role}</td>
                    <td data-label="Providers">{u.providers.join(', ')}</td>
                    <td>
                      {u.role === 'user' ? (
                        <button className="cms-secondary" disabled={busy} onClick={() => toggle(u)}>
                          {u.disabled ? 'Restore' : 'Suspend'}
                        </button>
                      ) : (
                        'Administrator'
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center gap-4 mt-5">
            <button
              className="cms-secondary"
              disabled={page <= 1 || busy}
              onClick={() => setPage(page - 1)}
            >
              Previous
            </button>
            <span className="text-sm">
              {page} / {data.pages}
            </span>
            <button
              className="cms-secondary"
              disabled={page >= data.pages || busy}
              onClick={() => setPage(page + 1)}
            >
              Next
            </button>
          </div>
        </>
      ) : (
        !error && <StatePanel loading title="Loading users" />
      )}
    </section>
  );
}
