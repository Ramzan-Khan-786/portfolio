import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, ExternalLink, FlaskConical, RefreshCcw } from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext.jsx';
import { safeUrl } from '../lib/content.js';
import { ContentLink, StatePanel } from './Ui.jsx';
import './Showroom.css';

export function getShowroomMotion(previousIndex, nextIndex) {
  return nextIndex >= previousIndex ? 'from-right' : 'from-left';
}
function EmbeddedProject({ item }) {
  const configured =
    item.embedUrl ||
    item.externalUrl ||
    (item.project?.slug === 'typewriter' ? import.meta.env.VITE_TYPEWRITER_URL : '');
  const url = safeUrl(configured);
  const sameOrigin = url && new URL(url).origin === window.location.origin;
  const frame = useRef(null);
  const [state, setState] = useState('loading');
  const [attempt, setAttempt] = useState(0);
  const [help, setHelp] = useState(false);
  useEffect(() => {
    setState('loading');
    if (!url || sameOrigin) return undefined;
    const timer = window.setTimeout(
      () => setState((current) => (current === 'loading' ? 'timeout' : current)),
      12000,
    );
    const ready = (event) => {
      if (
        event.origin === new URL(url).origin &&
        event.source === frame.current?.contentWindow &&
        event.data?.type === 'portfolio:ready'
      )
        setState('ready');
    };
    window.addEventListener('message', ready);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('message', ready);
    };
  }, [url, sameOrigin, attempt]);
  if (!url || sameOrigin)
    return (
      <div className="showroom-message">
        <FlaskConical size={32} aria-hidden="true" />
        <p className="eyebrow">Integration in preparation</p>
        <h2>{item.label} isn’t connected yet.</h2>
        <p>The live experience will appear here once its independent deployment is available.</p>
        <ContentLink className="secondary-action" to={item.externalUrl}>
          Open full project <ExternalLink size={16} />
        </ContentLink>
      </div>
    );
  return (
    <div className="embed-shell">
      <div className="embed-toolbar">
        <span>{item.label} / interactive experience</span>
        <span>{state === 'ready' ? 'Connected' : 'Independent application'}</span>
      </div>
      <div className="embed-stage">
        {(state === 'loading' || state === 'timeout') && (
          <div className="embed-notice" role="status">
            <p>
              {state === 'loading'
                ? 'Opening ' + item.label + '…'
                : 'This project is taking longer than expected. You can retry or open the full site.'}
            </p>
          </div>
        )}
        <iframe
          key={attempt + url}
          ref={frame}
          src={url}
          title={item.label + ' live experience'}
          sandbox="allow-scripts allow-forms allow-popups allow-same-origin"
          referrerPolicy="strict-origin-when-cross-origin"
          onLoad={() => setState((current) => (current === 'ready' ? current : 'loaded'))}
          onError={() => {
            setState('timeout');
            setHelp(true);
          }}
        />
      </div>
      <div className="embed-actions">
        <button
          onClick={() => {
            setState('loading');
            setAttempt(attempt + 1);
          }}
        >
          <RefreshCcw size={15} />
          Reload
        </button>
        <button aria-expanded={help} onClick={() => setHelp(!help)}>
          Having trouble?
        </button>
        <ContentLink to={item.externalUrl || url}>
          Open full project <ExternalLink size={15} />
        </ContentLink>
      </div>
      {help && (
        <p className="embed-help" role="status">
          A blank or blocked window may mean the project doesn’t allow embedding, is offline, or
          requires browser permissions. Try reloading or opening the full project above.
        </p>
      )}
    </div>
  );
}
function Presentation({ item }) {
  if (item.status === 'coming-soon' || item.presentationType === 'coming-soon')
    return (
      <div className="showroom-message">
        <span className="coming-soon-symbol">
          <FlaskConical size={28} />
        </span>
        <p className="eyebrow">Coming soon</p>
        <h2>{item.label}</h2>
        <p>
          {item.description ||
            'This project is in development. Its interactive experience will be available here when it is ready.'}
        </p>
      </div>
    );
  return <EmbeddedProject item={item} />;
}
export default function Showroom() {
  const {
    content: { showroom: items },
  } = usePortfolio();
  const [selectedId, setSelectedId] = useState(null);
  const [leaving, setLeaving] = useState(null);
  const [motion, setMotion] = useState('from-right');
  const timer = useRef(null);
  const tabs = useRef([]);
  const defaultItem = items.find((item) => item.isDefault) || items[0];
  const active = items.find((item) => item._id === selectedId) || defaultItem;
  const activeIndex = items.indexOf(active);
  useEffect(() => () => clearTimeout(timer.current), []);
  function select(index, focus = false) {
    if (!items[index]) return;
    if (items[index]._id !== active?._id) {
      clearTimeout(timer.current);
      const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
      setLeaving(reduced ? null : active);
      setMotion(getShowroomMotion(activeIndex, index));
      setSelectedId(items[index]._id);
      timer.current = window.setTimeout(() => setLeaving(null), 480);
    }
    if (focus) tabs.current[index]?.focus();
    tabs.current[index]?.scrollIntoView?.({
      block: 'nearest',
      inline: 'nearest',
      behavior: 'auto',
    });
  }
  function keyDown(event, index) {
    const next =
      event.key === 'ArrowRight'
        ? (index + 1) % items.length
        : event.key === 'ArrowLeft'
          ? (index - 1 + items.length) % items.length
          : event.key === 'Home'
            ? 0
            : event.key === 'End'
              ? items.length - 1
              : null;
    if (next !== null) {
      event.preventDefault();
      select(next, true);
    }
  }
  return (
    <section id="showroom" className="showroom-section" aria-labelledby="showroom-title">
      <div className="shell">
        <div className="project-selector" role="tablist" aria-label="Showroom projects">
          {items.map((item, index) => (
            <button
              ref={(element) => {
                tabs.current[index] = element;
              }}
              key={item._id}
              id={'tab-' + item._id}
              role="tab"
              tabIndex={index === activeIndex ? 0 : -1}
              aria-selected={index === activeIndex}
              aria-controls={'panel-' + item._id}
              onKeyDown={(event) => keyDown(event, index)}
              className={index === activeIndex ? 'active' : ''}
              onClick={() => select(index)}
            >
              <span>{String(index + 1).padStart(2, '0')}</span>
              {item.label}
              {item.status === 'coming-soon' && <small>soon</small>}
            </button>
          ))}
        </div>
        <div className="showroom-heading">
          <div>
            <p className="eyebrow">Engineering showroom</p>
            <h1 id="showroom-title">Interact with the work.</h1>
          </div>
          <p>
            Step inside selected projects. Explore an experience, switch to another, and see what’s
            coming next.
          </p>
        </div>
        {active ? (
          <>
            <div className={'showroom-window ' + motion}>
              {leaving && leaving._id !== active._id && (
                <div
                  key={leaving._id}
                  className="showroom-panel outgoing"
                  aria-hidden="true"
                  inert=""
                >
                  <Presentation item={leaving} />
                </div>
              )}
              <div
                key={active._id}
                id={'panel-' + active._id}
                role="tabpanel"
                aria-labelledby={'tab-' + active._id}
                tabIndex="0"
                className={'showroom-panel ' + (leaving ? 'incoming' : '')}
              >
                <Presentation item={active} />
              </div>
            </div>
            <div className="showroom-caption">
              <div>
                <span>Selected experience</span>
                <strong>{active.label}</strong>
              </div>
              <p>{active.project?.summary || active.description}</p>
              <div className="showroom-step">
                <button
                  aria-label="Previous project"
                  disabled={activeIndex === 0}
                  onClick={() => select(activeIndex - 1)}
                >
                  <ArrowLeft size={18} />
                </button>
                <button
                  aria-label="Next project"
                  disabled={activeIndex === items.length - 1}
                  onClick={() => select(activeIndex + 1)}
                >
                  <ArrowRight size={18} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <StatePanel
            title="The showroom is quiet for now"
            message="Interactive projects will appear here as they become available."
          />
        )}
      </div>
    </section>
  );
}
