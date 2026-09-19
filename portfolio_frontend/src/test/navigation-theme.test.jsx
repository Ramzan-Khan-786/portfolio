import { useRef } from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { ThemeProvider } from '../context/ThemeContext.jsx';
import ThemeSelector from '../components/ThemeSelector.jsx';
import useBoundaryNavigation, {
  atBoundary,
  nestedScroller,
} from '../hooks/useBoundaryNavigation.js';
import { pageSequence, navigationTarget } from '../lib/navigation.js';
let appearance = {};
vi.mock('../context/PortfolioContext.jsx', () => ({
  usePortfolio: () => ({ content: { sections: { appearance } } }),
}));
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  localStorage.clear();
  appearance = {};
});
const previous = { destination: '/' },
  next = { destination: '/skills' };
function Boundary({ navigate, enabled = true }) {
  const ref = useRef();
  useBoundaryNavigation(ref, { enabled, routeKey: 'profile', previous, next, navigate });
  return (
    <main ref={ref} data-testid="scroller">
      <div data-testid="content">Content</div>
      <textarea aria-label="Input" />
    </main>
  );
}
function dimensions(el, top = 100) {
  Object.defineProperties(el, {
    scrollHeight: { configurable: true, value: 1000 },
    clientHeight: { configurable: true, value: 400 },
  });
  el.scrollTop = top;
}
describe('boundary navigation', () => {
  it('uses a small tolerance only at the true page boundary', () => {
    expect(atBoundary({ scrollTop: 300, clientHeight: 400, scrollHeight: 1000 }, 1)).toBe(false);
    expect(atBoundary({ scrollTop: 599, clientHeight: 400, scrollHeight: 1000 }, 1)).toBe(true);
    expect(atBoundary({ scrollTop: 4 }, -1)).toBe(false);
  });
  it('never navigates mid-page or from the same gesture reaching the bottom; locks subsequent momentum', () => {
    let now = 0;
    vi.spyOn(performance, 'now').mockImplementation(() => now);
    const navigate = vi.fn();
    render(<Boundary navigate={navigate} />);
    const root = screen.getByTestId('scroller');
    dimensions(root);
    now = 1000;
    fireEvent.wheel(root, { deltaY: 200 });
    expect(navigate).not.toHaveBeenCalled();
    root.scrollTop = 600;
    now = 1100;
    fireEvent.wheel(root, { deltaY: 150 });
    expect(navigate).not.toHaveBeenCalled();
    now = 1500;
    fireEvent.wheel(root, { deltaY: 150 });
    expect(navigate).toHaveBeenCalledWith('/skills', { state: { pageDirection: 1 } });
    now = 1600;
    fireEvent.wheel(root, { deltaY: 300 });
    expect(navigate).toHaveBeenCalledTimes(1);
  });
  it('ignores form focus, horizontal gestures and modifier zoom', () => {
    let now = 0;
    vi.spyOn(performance, 'now').mockImplementation(() => now);
    const navigate = vi.fn();
    render(<Boundary navigate={navigate} />);
    const root = screen.getByTestId('scroller');
    dimensions(root, 600);
    now = 1200;
    screen.getByLabelText('Input').focus();
    fireEvent.wheel(root, { deltaY: 300 });
    screen.getByLabelText('Input').blur();
    now += 400;
    fireEvent.wheel(root, { deltaY: 100, deltaX: 500 });
    now += 400;
    fireEvent.wheel(root, { deltaY: 300, ctrlKey: true });
    expect(navigate).not.toHaveBeenCalled();
  });
  it('respects nested scroll areas and the disabled setting', () => {
    render(<Boundary navigate={vi.fn()} enabled={false} />);
    const root = screen.getByTestId('scroller'),
      nested = screen.getByTestId('content');
    nested.style.overflowY = 'auto';
    dimensions(nested);
    expect(nestedScroller(nested, root, 1)).toBe(true);
  });
  it('requires a deliberate vertical touch starting at the boundary', () => {
    let now = 0;
    vi.spyOn(performance, 'now').mockImplementation(() => now);
    const navigate = vi.fn();
    render(<Boundary navigate={navigate} />);
    const root = screen.getByTestId('scroller');
    dimensions(root, 600);
    now = 1200;
    fireEvent.touchStart(root, { touches: [{ clientX: 10, clientY: 250 }] });
    fireEvent.touchEnd(root, { changedTouches: [{ clientX: 15, clientY: 80 }] });
    expect(navigate).toHaveBeenCalledTimes(1);
  });
  it('deduplicates CMS route sequence and excludes external/disabled links', () => {
    expect(navigationTarget({ destination: '#skills' })).toBe('/skills');
    expect(
      pageSequence([
        { destination: '/' },
        { destination: '/' },
        { destination: '/skills' },
        { destination: '/work', enabled: false },
        { destination: 'https://example.com', type: 'external' },
      ]).map((v) => v.destination),
    ).toEqual(['/', '/skills']);
  });
});
describe('theme preferences', () => {
  it('applies each of the five themes and persists the visitor selection', () => {
    render(
      <ThemeProvider>
        <ThemeSelector />
      </ThemeProvider>,
    );
    for (const theme of ['dark', 'light', 'midnight', 'graphite', 'terminal']) {
      fireEvent.change(screen.getByLabelText('Theme'), { target: { value: theme } });
      expect(document.documentElement.dataset.theme).toBe(theme);
      expect(localStorage.getItem('portfolio-theme')).toBe(theme);
    }
  });
  it('honors enabled themes and CMS first-visit defaults', () => {
    appearance = {
      enabledThemes: ['midnight', 'graphite'],
      defaultTheme: 'graphite',
      followSystem: false,
    };
    render(
      <ThemeProvider>
        <ThemeSelector />
      </ThemeProvider>,
    );
    expect(document.documentElement.dataset.theme).toBe('graphite');
    expect(screen.queryByRole('option', { name: 'Dark', exact: true })).toBeNull();
  });
});
