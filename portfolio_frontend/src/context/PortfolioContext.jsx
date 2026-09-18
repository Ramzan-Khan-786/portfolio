import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { apiClient } from '../lib/api.js';
import { emptyContent } from '../lib/content.js';
const PortfolioContext = createContext(null);
export function PortfolioProvider({ children }) {
  const [content, setContent] = useState(emptyContent);
  const [status, setStatus] = useState('loading');
  const [sourceError, setSourceError] = useState('');
  const requestId = useRef(0);
  const refresh = useCallback(async () => {
    const id = ++requestId.current;
    setStatus('loading');
    try {
      const result = await apiClient.bootstrap();
      if (id !== requestId.current) return;
      setContent({ ...emptyContent, ...result });
      setSourceError('');
      setStatus('ready');
    } catch (error) {
      if (id !== requestId.current) return;
      setSourceError(error.message);
      setStatus('error');
    }
  }, []);
  useEffect(() => {
    refresh();
    return () => {
      requestId.current += 1;
    };
  }, [refresh]);
  const value = useMemo(
    () => ({ content, status, sourceError, refresh }),
    [content, status, sourceError, refresh],
  );
  return <PortfolioContext.Provider value={value}>{children}</PortfolioContext.Provider>;
}
export function usePortfolio() {
  const context = useContext(PortfolioContext);
  if (!context) throw new Error('PortfolioProvider is required');
  return context;
}
