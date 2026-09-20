import { useCallback, useEffect, useRef, useState } from 'react';
export default function useUnsavedChanges(values) {
  const [baseline, setBaseline] = useState(null);
  const dirty = baseline !== null && JSON.stringify(values) !== baseline;
  const dirtyRef = useRef(dirty); dirtyRef.current = dirty;
  useEffect(() => {
    const unload = (event) => { if (dirtyRef.current) { event.preventDefault(); event.returnValue = ''; } };
    const navigate = (event) => {
      if (!dirtyRef.current || event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey) return;
      const link = event.target.closest?.('a[href]');
      if (!link || link.target === '_blank') return;
      const url = new URL(link.href);
      if (url.origin === location.origin && url.pathname !== location.pathname && !window.confirm('Leave this editor without saving changes?')) {
        event.preventDefault(); event.stopPropagation();
      }
    };
    window.addEventListener('beforeunload', unload); document.addEventListener('click', navigate, true);
    return () => { window.removeEventListener('beforeunload', unload); document.removeEventListener('click', navigate, true); };
  }, []);
  const markSaved = useCallback((value) => setBaseline(JSON.stringify(value)), []);
  return { dirty, markSaved };
}
