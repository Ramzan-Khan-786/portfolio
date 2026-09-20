import { Suspense, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Outlet, useLocation, useNavigate, useNavigationType } from 'react-router-dom';
import SiteHeader from '../components/SiteHeader.jsx';
import SiteFooter from '../components/SiteFooter.jsx';
import { StatePanel } from '../components/Ui.jsx';
import { usePortfolio } from '../context/PortfolioContext.jsx';
import useBoundaryNavigation from '../hooks/useBoundaryNavigation.js';
import { pageSequence } from '../lib/navigation.js';
import './PublicLayout.css';
export default function PublicLayout() {
  const { content, status, sourceError, refresh } = usePortfolio();
  const location = useLocation(),
    navigationType = useNavigationType(),
    navigate = useNavigate();
  const scroll = useRef(null),
    positions = useRef(new Map());
  const sequence = useMemo(() => pageSequence(content.navigation), [content.navigation]);
  const index = sequence.findIndex(
    (item) => item.destination === (location.pathname === '/home' ? '/' : location.pathname),
  );
  const previous = sequence[index - 1],
    next = index >= 0 ? sequence[index + 1] : null;
  const [scrollNavigation, setScrollNavigation] = useState(() => {
    try {
      return localStorage.getItem('portfolio-scroll-navigation') !== 'off';
    } catch {
      return true;
    }
  });
  const [reduced, setReduced] = useState(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );
  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const change = () => setReduced(query.matches);
    query.addEventListener('change', change);
    return () => query.removeEventListener('change', change);
  }, []);
  const isShowroom = location.pathname === '/showroom';
  useBoundaryNavigation(scroll, {
    enabled: scrollNavigation && !reduced && status === 'ready' && index >= 0,
    routeKey: location.key,
    previous,
    next,
    navigate,
  });
  useLayoutEffect(() => {
    const node = scroll.current;
    if (!node) return;
    const saved = positions.current;
    const top =
      navigationType === 'POP'
        ? saved.get(location.key) || 0
        : location.state?.pageDirection === -1
          ? Infinity
          : 0;
    let restoring = true;
    const restore = () => {
      if (restoring) node.scrollTop = top === Infinity ? node.scrollHeight : top;
    };
    restore();
    const observer = new ResizeObserver(restore);
    if (node.firstElementChild) observer.observe(node.firstElementChild);
    const done = () => {
      restoring = false;
      observer.disconnect();
    };
    const timer = setTimeout(done, 600);
    const save = () => saved.set(location.key, node.scrollTop);
    node.addEventListener('scroll', save, { passive: true });
    node.addEventListener('wheel', done, { passive: true });
    node.addEventListener('touchstart', done, { passive: true });
    if (status === 'ready' && navigationType !== 'POP') node.focus({ preventScroll: true });
    if (location.hash) {
      try {
        document.getElementById(decodeURIComponent(location.hash.slice(1)))?.scrollIntoView();
      } catch {
        /* Ignore malformed fragments. */
      }
    }
    return () => {
      clearTimeout(timer);
      observer.disconnect();
      node.removeEventListener('scroll', save);
      node.removeEventListener('wheel', done);
      node.removeEventListener('touchstart', done);
    };
  }, [location.key, location.hash, location.state, navigationType, status]);
  function toggle() {
    setScrollNavigation((value) => {
      try {
        localStorage.setItem('portfolio-scroll-navigation', value ? 'off' : 'on');
      } catch {
        /* Optional persistence. */
      }
      return !value;
    });
  }
  return (
    <div className="portfolio-frame">
      <SiteHeader />
      <main
        ref={scroll}
        id="main"
        tabIndex="-1"
        className={'page-scroll ' + (isShowroom ? 'showroom-scroll' : '')}
        aria-label="Portfolio page"
      >
        <div
          key={location.key}
          className={'route-view ' + (location.state?.pageDirection === -1 ? 'route-back' : '')}
          data-route={location.pathname}
        >
          {status === 'loading' ? (
            <StatePanel loading title="Loading portfolio" />
          ) : status === 'error' ? (
            <StatePanel
              title="Portfolio temporarily unavailable"
              message={sourceError}
              retry={refresh}
            />
          ) : (
            <Suspense fallback={<StatePanel loading title="Opening page" />}>
              <Outlet />
            </Suspense>
          )}
        </div>
      </main>
      <SiteFooter
        previous={previous}
        next={next}
        position={index >= 0 ? String(index + 1).padStart(2, '0') : null}
        total={sequence.length}
        scrollEnabled={scrollNavigation && !reduced}
        toggleScroll={toggle}
        reduced={reduced}
      />
    </div>
  );
}
