import { useEffect, useRef, useState } from 'react';
import { ExternalLink, RefreshCcw, AlertCircle } from 'lucide-react';
import { safeUrl } from '../../lib/content.js';
import { ContentImage, ContentLink } from '../../components/Ui.jsx';
export default function EmbeddedProject({ item }) {
  const configured =
    item.embedUrl ||
    item.externalUrl ||
    (item.project?.slug === 'typewriter' ? import.meta.env.VITE_TYPEWRITER_URL : '');
  const url = safeUrl(configured),
    sameOrigin = url && new URL(url).origin === window.location.origin;
  const frame = useRef(null);
  const [state, setState] = useState('loading'),
    [attempt, setAttempt] = useState(0),
    [help, setHelp] = useState(false);
  useEffect(() => {
    setState('loading');
    setHelp(false);
    if (!url || sameOrigin) return;
    const timer = setTimeout(
      () => setState((current) => (current === 'loading' ? 'timeout' : current)),
      12000,
    );
    function ready(event) {
      if (
        event.origin === new URL(url).origin &&
        event.source === frame.current?.contentWindow &&
        event.data?.type === 'portfolio:ready'
      )
        setState('ready');
    }
    window.addEventListener('message', ready);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('message', ready);
    };
  }, [url, sameOrigin, attempt]);
  if (!url || sameOrigin)
    return (
      <div className="showroom-message">
        {item.fallbackMedia?.url ? <ContentImage src={item.fallbackMedia.url} alt={item.fallbackMedia.altText || item.label + ' preview'} className="showroom-support-image" /> : <AlertCircle size={25} />}
        <p className="eyebrow">Integration unavailable</p>
        <h2>{item.label} isn’t connected yet.</h2>
        <p>
          {item.fallbackMessage ||
            'The independent application will appear here when its deployment is connected.'}
        </p>
        <ContentLink className="secondary-action" to={item.externalUrl}>
          Open full project
          <ExternalLink size={15} />
        </ContentLink>
      </div>
    );
  return (
    <div className="embed-shell">
      <div className="embed-toolbar">
        <span>
          <span className="embed-dot" />
          {state === 'ready' ? 'Connected' : 'Independent application'}
        </span>
        <div className="flex items-center gap-3">
          <button
            aria-label={'Reload ' + item.label}
            onClick={() => {
              setState('loading');
              setAttempt(attempt + 1);
            }}
          >
            <RefreshCcw size={14} />
          </button>
          <button aria-expanded={help} onClick={() => setHelp(!help)}>
            Having trouble?
          </button>
        </div>
      </div>
      <div className="embed-stage" data-scroll-lock>
        {(state === 'loading' || state === 'timeout') && (
          <div className="embed-notice" role="status">
            {state === 'loading'
              ? 'Opening ' + item.label + '…'
              : 'The application is taking longer than expected. Retry or open the full project.'}
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
        {help && (
          <div className="embed-help" role="status">
            A blank or blocked window may mean this application is offline or does not permit
            embedding. Reload it or use Open live project below.
          </div>
        )}
      </div>
    </div>
  );
}
