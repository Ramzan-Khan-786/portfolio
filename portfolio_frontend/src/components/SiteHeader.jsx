import { Menu, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { usePortfolio } from '../context/PortfolioContext.jsx';
import { safeUrl } from '../lib/content.js';
import { ContentImage, ContentLink } from './Ui.jsx';
import './SiteHeader.css';

export default function SiteHeader() {
  const {
    content: { profile, navigation },
  } = usePortfolio();
  const [open, setOpen] = useState(false);
  const trigger = useRef(null);
  const location = useLocation();
  useEffect(() => {
    setOpen(false);
  }, [location]);
  const items = navigation.filter(
    (item) =>
      item.enabled !== false &&
      item.type !== 'action' &&
      safeUrl(item.destination, { internal: true }),
  );
  const close = () => {
    setOpen(false);
    trigger.current?.focus();
  };
  const links = (mobile) =>
    items
      .filter((item) => item[mobile ? 'visibleOnMobile' : 'visibleOnDesktop'] !== false)
      .map((item) => {
        const to = item.destination.startsWith('#') ? '/' + item.destination : item.destination;
        return (
          <ContentLink
            key={item._id}
            to={to}
            aria-current={to === location.pathname + location.hash ? 'page' : undefined}
            onClick={() => setOpen(false)}
          >
            {item.label}
          </ContentLink>
        );
      });
  return (
    <header
      className="site-header"
      onKeyDown={(event) => {
        if (event.key === 'Escape') close();
      }}
    >
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <div className="shell header-inner">
        <Link to="/" className="identity" aria-label="Go to profile">
          <ContentImage
            src={profile?.profileImage}
            alt=""
            initials={profile?.initials || 'RK'}
            className="identity-mark"
            width="32"
            height="32"
          />
          <span>{profile?.name || 'Engineering Portfolio'}</span>
        </Link>
        <nav className="desktop-nav" aria-label="Main navigation">
          {links(false)}
        </nav>
        <button
          ref={trigger}
          className="menu-trigger"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          aria-controls="mobile-navigation"
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>
      {open && (
        <nav id="mobile-navigation" className="mobile-nav shell" aria-label="Mobile navigation">
          {links(true)}
        </nav>
      )}
    </header>
  );
}
