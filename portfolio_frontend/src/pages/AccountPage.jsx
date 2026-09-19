import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { StatePanel } from '../components/Ui.jsx';
import Metadata from '../components/Metadata.jsx';
import Account from '../features/admin/Account.jsx';
import './AuthPage.css';
export default function AccountPage() {
  const { user, checking, error, logout, retry } = useAuth();
  const [message, setMessage] = useState(''),
    [failure, setFailure] = useState(''),
    [busy, setBusy] = useState(false);
  if (checking) return <StatePanel loading title="Checking your account" />;
  if (error) return <StatePanel title="Account unavailable" message={error} retry={retry} />;
  if (!user) return <Navigate to="/login" replace />;
  async function signOut() {
    setBusy(true);
    setFailure('');
    try {
      await logout();
    } catch (e) {
      setFailure(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <article className="shell account-layout">
      <Metadata title="Your account" />
      <header className="account-identity">
        <p className="eyebrow">Portfolio / account</p>
        <h1>{user.name}</h1>
        <p className="text-sm text-secondary mt-2 break-all">{user.email}</p>
        <p className="text-xs text-muted mt-3">
          Sign-in methods: {(user.providers || ['password']).join(' + ')}
        </p>
        <div className="flex flex-wrap gap-3 mt-6">
          {user.role === 'admin' && (
            <Link to="/admin" className="primary-action">
              Open CMS
            </Link>
          )}
          <button className="secondary-action" disabled={busy} onClick={signOut}>
            {busy ? 'Signing out…' : 'Sign out'}
          </button>
        </div>
        {failure && (
          <p className="cms-error" role="alert">
            {failure}
          </p>
        )}
      </header>
      {message && (
        <p className="text-sm text-accent mb-5" role="status">
          {message}
        </p>
      )}
      <Account notify={setMessage} />
    </article>
  );
}
