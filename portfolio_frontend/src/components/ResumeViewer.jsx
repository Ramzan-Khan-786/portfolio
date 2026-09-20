import { useEffect, useRef, useState } from 'react';
import * as pdfjs from 'pdfjs-dist';
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import 'pdfjs-dist/web/pdf_viewer.css';
import './ResumeViewer.css';
pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;
export default function ResumeViewer({ url, downloadUrl, title = 'Resume PDF', onReady }) {
  const host = useRef(null), container = useRef(null), pages = useRef(null), engine = useRef(null), ready = useRef(onReady);
  ready.current = onReady;
  const [state, setState] = useState('loading'), [error, setError] = useState('');
  const [page, setPage] = useState(1), [count, setCount] = useState(0), [zoom, setZoom] = useState(100);
  const [query, setQuery] = useState(''), [matches, setMatches] = useState(''), [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let disposed = false, loadingTask, viewer, findController, linkService;
    const controller = new AbortController();
    setState('loading'); setError(''); setQuery(''); setMatches(''); setCount(0); setPage(1); setZoom(100);
    async function open() {
      try {
        // The official viewer module expects its matching API build on this global.
        globalThis.pdfjsLib = pdfjs;
        const { EventBus, PDFViewer, PDFLinkService, PDFFindController } = await import('pdfjs-dist/web/pdf_viewer.mjs');
        if (disposed) return;
        const eventBus = new EventBus();
        linkService = new PDFLinkService({ eventBus, externalLinkTarget: 2, externalLinkRel: 'noopener noreferrer nofollow' });
        findController = new PDFFindController({ eventBus, linkService });
        viewer = new PDFViewer({ container: container.current, viewer: pages.current, eventBus, linkService, findController,
          textLayerMode: 1, annotationMode: pdfjs.AnnotationMode.ENABLE, annotationEditorMode: -1,
          enableScripting: false, abortSignal: controller.signal, maxCanvasPixels: 12000000 });
        linkService.setViewer(viewer);
        engine.current = { viewer, eventBus };
        let acknowledged = false;
        eventBus.on('pagerendered', ({ error: renderError }) => { if (disposed) return; if (renderError) { setError('A PDF page could not render. Try the original document.'); } else if (!acknowledged) { acknowledged = true; ready.current?.(); } });
        eventBus.on('pagesinit', () => { if (!disposed) viewer.currentScaleValue = 'page-width'; });
        eventBus.on('pagechanging', ({ pageNumber }) => { if (!disposed) setPage(pageNumber); });
        eventBus.on('scalechanging', ({ scale }) => { if (!disposed) setZoom(Math.round(scale * 100)); });
        eventBus.on('updatefindmatchescount', ({ matchesCount }) => { if (!disposed) setMatches(matchesCount.total ? matchesCount.current + ' / ' + matchesCount.total : 'No matches'); });
        eventBus.on('updatefindcontrolstate', ({ state: findState }) => { if (!disposed && findState === 1) setMatches('No matches'); });
        const assets = new URL(import.meta.env.BASE_URL + 'pdfjs-assets/', window.location.origin).href;
        loadingTask = pdfjs.getDocument({ url, withCredentials: true, isEvalSupported: false,
          enableXfa: false, cMapUrl: assets + 'cmaps/', cMapPacked: true,
          standardFontDataUrl: assets + 'standard_fonts/', wasmUrl: assets + 'wasm/' });
        const document = await loadingTask.promise;
        if (disposed) { await document.destroy(); return; }
        linkService.setDocument(document); findController.setDocument(document); viewer.setDocument(document);
        setCount(document.numPages); setState('ready');
      } catch (failure) {
        if (!disposed) { setState('error'); setError(failure?.name === 'PasswordException' ? 'Password-protected PDFs are not supported.' : 'The PDF could not be rendered. Retry or open the original document.'); }
      }
    }
    open();
    return () => {
      disposed = true; engine.current = null;
      viewer?.setDocument(null); linkService?.setDocument(null); findController?.setDocument(null); controller.abort();
      loadingTask?.destroy().catch(() => {});
    };
  }, [url, attempt]);
  function find(previous = false, type = 'again') {
    engine.current?.eventBus.dispatch('find', { source: host.current, type, query, caseSensitive: false,
      entireWord: false, highlightAll: true, findPrevious: previous, matchDiacritics: false });
  }
  useEffect(() => {
    const timer = setTimeout(() => {
      engine.current?.eventBus.dispatch('find', { source: host.current, type: '', query, caseSensitive: false,
        entireWord: false, highlightAll: true, findPrevious: false, matchDiacritics: false });
    }, 200);
    return () => clearTimeout(timer);
  }, [query]);
  function go(value) { if (engine.current && value >= 1 && value <= count) engine.current.viewer.currentPageNumber = value; }
  function scale(multiplier) { if (engine.current) engine.current.viewer.currentScale = Math.max(.25, Math.min(4, engine.current.viewer.currentScale * multiplier)); }
  return <section className="resume-viewer" ref={host} data-scroll-lock aria-label={title}>
    <div className="pdf-toolbar">
      <div className="pdf-tool-group">
        <button type="button" disabled={state !== 'ready' || page <= 1} onClick={() => go(page - 1)} aria-label="Previous PDF page">←</button>
        <label>Page <input aria-label="PDF page number" type="number" min="1" max={count || 1} value={page} disabled={state !== 'ready'} onChange={(event) => go(Number(event.target.value))} /></label><span>/ {count || '—'}</span>
        <button type="button" disabled={state !== 'ready' || page >= count} onClick={() => go(page + 1)} aria-label="Next PDF page">→</button>
      </div>
      <div className="pdf-tool-group">
        <button type="button" disabled={state !== 'ready'} onClick={() => scale(1 / 1.2)} aria-label="Zoom out">−</button><span>{zoom}%</span>
        <button type="button" disabled={state !== 'ready'} onClick={() => scale(1.2)} aria-label="Zoom in">+</button>
        <button type="button" disabled={state !== 'ready'} onClick={() => { engine.current.viewer.currentScaleValue = 'page-width'; }}>Fit width</button>
      </div>
      <div className="pdf-tool-group">
        <button type="button" onClick={async () => { try { if (document.fullscreenElement) await document.exitFullscreen(); else await host.current.requestFullscreen(); } catch { setError('Fullscreen is unavailable in this browser.'); } }}>Fullscreen</button>
        <a href={url} target="_blank" rel="noopener noreferrer">Open PDF ↗</a>
        {downloadUrl && <a href={downloadUrl} target="_blank" rel="noopener noreferrer" download>Download</a>}
      </div>
      <div className="pdf-search">
        <input type="search" aria-label="Search PDF" placeholder="Search this PDF" value={query} disabled={state !== 'ready'} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); find(e.shiftKey); } }} />
        <button type="button" onClick={() => find(true)} disabled={!query}>Previous match</button>
        <button type="button" onClick={() => find(false)} disabled={!query}>Next match</button>
        <span role="status">{matches}</span>
      </div>
    </div>
    {state === 'loading' && <p className="pdf-status" role="status">Loading PDF and text layer…</p>}
    {error && <p className="pdf-status cms-error" role="alert">{error} <button type="button" onClick={() => setAttempt(attempt + 1)}>Retry</button></p>}
    <div className="pdf-stage"><div ref={container} className="pdf-scroll" tabIndex="0" aria-label="Scrollable PDF pages"><div ref={pages} className="pdfViewer" /></div></div>
  </section>;
}
