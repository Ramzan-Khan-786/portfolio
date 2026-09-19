import { Menu, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { usePortfolio } from '../context/PortfolioContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { safeUrl } from '../lib/content.js';
import { navigationTarget } from '../lib/navigation.js';
import { ContentLink } from './Ui.jsx';
import ThemeSelector from './ThemeSelector.jsx';
import './SiteHeader.css';
export default function SiteHeader() {
  const {
    content: { profile, navigation },
  } = usePortfolio();
  const auth = useAuth();
  const [open, setOpen] = useState(false);
  const trigger = useRef(null);
  const location = useLocation();
  useEffect(() => setOpen(false), [location]);
  const close = () => {
    setOpen(false);
    trigger.current?.focus();
  };
  const items = navigation.filter(
    (item) =>
      item.enabled !== false &&
      item.type !== 'action' &&
      safeUrl(item.destination, { internal: true }),
  );
  const links = (mobile) =>
    items
      .filter((item) => item[mobile ? 'visibleOnMobile' : 'visibleOnDesktop'] !== false)
      .map((item) => (
        <ContentLink
          key={item._id}
          to={navigationTarget(item)}
          aria-current={navigationTarget(item) === location.pathname ? 'page' : undefined}
          onClick={() => setOpen(false)}
        >
          {item.label}
        </ContentLink>
      ));
  return (
    <header
      className="site-header"
      onKeyDown={(event) => {
        if (event.key === 'Escape') close();
      }}
    >
      <a
        href="#main"
        className="skip-link"
        onClick={() => document.getElementById('main')?.focus()}
      >
        Skip to content
      </a>
      <div className="header-inner">
        <Link to="/" className="identity" aria-label="Go to home">
          <span className="identity-mark">
            {profile?.initials || 'RK'}
            <span className="identity-dot" />
          </span>
          <span className="identity-name">{profile?.name || 'Engineering portfolio'}</span>
        </Link>
        <nav className="desktop-nav" aria-label="Main navigation">
          {links(false)}
        </nav>
        <div className="header-controls">
          <ThemeSelector />
          <Link className="account-link" to={auth?.user ? '/account' : '/login'}>
            {auth?.user ? 'Account' : 'Sign in'}
          </Link>
          <button
            ref={trigger}
            className="menu-trigger"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            aria-controls="mobile-navigation"
            onClick={() => setOpen(!open)}
          >
            {open ? <X size={19} /> : <Menu size={19} />}
          </button>
        </div>
      </div>
      {open && (
        <nav id="mobile-navigation" className="mobile-nav" aria-label="Mobile navigation">
          {links(true)}
          <Link to={auth?.user ? '/account' : '/login'}>
            {auth?.user ? 'My account' : 'Sign in / Create account'}
          </Link>
        </nav>
      )}
    </header>
  );
}
