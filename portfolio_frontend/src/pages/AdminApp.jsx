import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { CheckCircle2, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import ThemeSelector from '../components/ThemeSelector.jsx';
import ContentEditor from '../features/admin/ContentEditor.jsx';
import ResumeEditor from '../features/admin/ResumeEditor.jsx';
import MediaLibrary from '../features/media/MediaLibrary.jsx';
import ThemeEditor from '../features/admin/ThemeEditor.jsx';
import UsersPanel from '../features/admin/UsersPanel.jsx';
import Operations from '../features/admin/Operations.jsx';
import { contentModules } from '../features/admin/sectionConfig.js';
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
        <div className="cms-theme">
          <ThemeSelector variant="admin" />
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
          ) : section === 'identity' ? (
            <ProfileEditor notify={notify} />
          ) : section === 'account' ? (
            <Account notify={notify} />
          ) : section === 'media' ? (
            <MediaLibrary notify={notify} />
          ) : section === 'appearance' ? (
            <ThemeEditor notify={notify} />
          ) : contentModules[section] ? (
            <ContentEditor
              key={section}
              section={section}
              config={contentModules[section]}
              notify={notify}
            />
          ) : section === 'resume' ? (
            <ResumeEditor notify={notify} />
          ) : section === 'users' ? (
            <UsersPanel notify={notify} />
          ) : section === 'system' ? (
            <Operations />
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
  const { user, setUser, checking, error, logout, retry } = useAuth();
  if (checking) return <StatePanel loading title="Checking your session" />;
  if (error)
    return <StatePanel title="CMS temporarily unavailable" message={error} retry={retry} />;
  if (user && user.role !== 'admin')
    return (
      <main className="cms-login">
        <StatePanel
          title="Administrator access required"
          message="Your account can access the portfolio, but cannot edit its content."
        />
        <Link className="primary-action" to="/account">
          Your account
        </Link>
      </main>
    );
  return user ? <Workspace user={user} logout={logout} /> : <Login onLogin={setUser} />;
}
