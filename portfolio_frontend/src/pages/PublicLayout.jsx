import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import SiteHeader from '../components/SiteHeader.jsx';
import SiteFooter from '../components/SiteFooter.jsx';
import { StatePanel } from '../components/Ui.jsx';
import { usePortfolio } from '../context/PortfolioContext.jsx';
import './PublicLayout.css';
export default function PublicLayout() {
  const { status, sourceError, refresh } = usePortfolio();
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (status !== 'ready') return;
    if (hash) document.getElementById(decodeURIComponent(hash.slice(1)))?.scrollIntoView();
    else window.scrollTo(0, 0);
  }, [pathname, hash, status]);
  return (
    <>
      <SiteHeader />
      <main id="main" className="min-h-[65vh]" tabIndex="-1">
        {status === 'loading' ? (
          <div className="shell">
            <StatePanel
              loading
              title="Loading portfolio"
              message="Gathering the latest work and profile."
            />
          </div>
        ) : status === 'error' ? (
          <div className="shell">
            <StatePanel
              title="Portfolio temporarily unavailable"
              message={sourceError}
              retry={refresh}
            />
          </div>
        ) : (
          <Outlet />
        )}
      </main>
      <SiteFooter />
    </>
  );
}
