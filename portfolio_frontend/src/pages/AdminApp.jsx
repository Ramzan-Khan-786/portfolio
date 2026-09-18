import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { CheckCircle2, LogOut, Menu, X } from 'lucide-react';
import { apiClient } from '../lib/api.js';
import { resources, sections } from '../features/admin/config.js';
import Login from '../features/admin/Login.jsx';
import Dashboard from '../features/admin/Dashboard.jsx';
import ProfileEditor from '../features/admin/ProfileEditor.jsx';
import ResourceManager from '../features/admin/ResourceManager.jsx';
import Account from '../features/admin/Account.jsx';
import { StatePanel } from '../components/Ui.jsx';
import Metadata from '../components/Metadata.jsx';
import './AdminApp.css';
function Workspace({ user, logout }) {
  const section = useLocation().pathname.split('/')[2] || 'dashboard';
  const [menuOpen, setMenuOpen] = useState(false);
  const [toast, setToast] = useState('');
  const [logoutError, setLogoutError] = useState('');
  const [loggingOut, setLoggingOut] = useState(false);
  const trigger = useRef(null);
  const sidebar = useRef(null);
  const timer = useRef(null);
  useEffect(() => () => clearTimeout(timer.current), []);
  const notify = (message) => {
    clearTimeout(timer.current);
    setToast(message);
    timer.current = setTimeout(() => setToast(''), 4000);
  };
  const closeMenu = () => {
    setMenuOpen(false);
    trigger.current?.focus();
  };
  useEffect(() => {
    if (!menuOpen) return undefined;
    const old = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    sidebar.current?.querySelector('a')?.focus();
    return () => {
      document.body.style.overflow = old;
    };
  }, [menuOpen]);
  function menuKeys(event) {
    if (event.key === 'Escape') {
      closeMenu();
      return;
    }
    if (event.key !== 'Tab' || !menuOpen) return;
    const nodes = [...sidebar.current.querySelectorAll('a,button')].filter(
      (node) => node.getClientRects().length,
    );
    const first = nodes[0],
      last = nodes[nodes.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }
  async function signOut() {
    setLoggingOut(true);
    setLogoutError('');
    try {
      await logout();
    } catch (error) {
      setLogoutError(error.message);
    } finally {
      setLoggingOut(false);
    }
  }
  return (
    <div className="cms-shell">
      <Metadata title="Admin" />
      {menuOpen && (
        <button
          className="cms-backdrop"
          aria-label="Close CMS navigation"
          tabIndex="-1"
          onClick={closeMenu}
        />
      )}
      <aside
        ref={sidebar}
        className={'cms-sidebar ' + (menuOpen ? 'open' : '')}
        onKeyDown={menuKeys}
      >
        <div className="flex items-center justify-between gap-3">
          <Link to="/" className="cms-logo">
            <span>RK</span>
            <div>
              <strong>Portfolio CMS</strong>
              <small>Engineering workspace</small>
            </div>
          </Link>
          <button className="cms-icon cms-close" aria-label="Close CMS menu" onClick={closeMenu}>
            <X size={19} />
          </button>
        </div>
        <nav className="my-8 grid gap-1" aria-label="CMS navigation">
          {sections.map(([key, label]) => (
            <NavLink
              key={key}
              to={key === 'dashboard' ? '/admin' : '/admin/' + key}
              end
              className={({ isActive }) => (isActive ? 'active' : '')}
              onClick={() => setMenuOpen(false)}
            >
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto border-t border-line pt-4">
          <strong className="block text-sm">{user.name}</strong>
          <span className="mt-1 block break-all text-xs text-stone-500">{user.email}</span>
          <Link to="/" className="mt-3 block min-h-11 py-3 text-sm text-moss">
            View public site ↗
          </Link>
          <button
            className="flex min-h-11 items-center gap-2 text-sm"
            disabled={loggingOut}
            onClick={signOut}
          >
            <LogOut size={16} />
            {loggingOut ? 'Signing out…' : 'Sign out'}
          </button>
          {logoutError && (
            <p className="cms-error" role="alert">
              {logoutError}
            </p>
          )}
        </div>
      </aside>
      <div className="min-w-0">
        <header className="cms-mobile-bar">
          <button
            ref={trigger}
            className="cms-icon"
            aria-label="Open CMS menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(true)}
          >
            <Menu size={20} />
          </button>
          <strong>{sections.find(([key]) => key === section)?.[1] || 'CMS'}</strong>
        </header>
        <main className="cms-content">
          {section === 'dashboard' ? (
            <Dashboard />
          ) : section === 'profile' ? (
            <ProfileEditor notify={notify} />
          ) : section === 'account' ? (
            <Account notify={notify} />
          ) : resources[section] ? (
            <ResourceManager key={section} resource={section} notify={notify} />
          ) : (
            <StatePanel title="CMS section not found" />
          )}
        </main>
      </div>
      {toast && (
        <div className="cms-toast" role="status">
          <CheckCircle2 size={18} />
          {toast}
        </div>
      )}
    </div>
  );
}
export default function AdminApp() {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    setChecking(true);
    setError('');
    apiClient
      .me()
      .then((data) => {
        if (active) setUser(data.user);
      })
      .catch((failure) => {
        if (active && failure.status !== 401 && failure.status !== 403) setError(failure.message);
      })
      .finally(() => {
        if (active) setChecking(false);
      });
    const expired = () => setUser(null);
    window.addEventListener('portfolio:session-expired', expired);
    return () => {
      active = false;
      window.removeEventListener('portfolio:session-expired', expired);
    };
  }, [attempt]);
  async function logout() {
    try {
      await apiClient.logout();
    } catch (failure) {
      if (failure.status !== 401) throw failure;
    }
    setUser(null);
  }
  if (checking) return <StatePanel loading title="Checking your session" />;
  if (error)
    return (
      <StatePanel
        title="CMS temporarily unavailable"
        message={error}
        retry={() => setAttempt(attempt + 1)}
      />
    );
  return user ? <Workspace user={user} logout={logout} /> : <Login onLogin={setUser} />;
}
