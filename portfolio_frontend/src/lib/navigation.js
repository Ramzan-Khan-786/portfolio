export const coreRoutes = [
  '/',
  '/profile',
  '/skills',
  '/work',
  '/showroom',
  '/resume',
  '/about',
  '/contact',
];
export function navigationTarget(item) {
  if (item.destination === '/home') return '/';
  const anchors = {
    '#home': '/',
    '#resume': '/resume',
    '#profile': '/profile',
    '#skills': '/skills',
    '#work': '/work',
    '#showroom': '/showroom',
    '#about': '/about',
    '#contact': '/contact',
  };
  return (
    anchors[item.destination] ||
    (item.destination?.startsWith('#') ? '/' + item.destination : item.destination)
  );
}
export function pageSequence(items) {
  const seen = new Set();
  return items
    .filter((item) => item.enabled !== false && item.type !== 'external' && item.type !== 'action')
    .map((item) => ({ ...item, destination: navigationTarget(item) }))
    .filter((item) => {
      if (!coreRoutes.includes(item.destination) || seen.has(item.destination)) return false;
      seen.add(item.destination);
      return true;
    });
}
