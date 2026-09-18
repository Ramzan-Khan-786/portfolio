import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { usePortfolio } from '../context/PortfolioContext.jsx';
import { settingValue, safeUrl } from '../lib/content.js';
export default function Metadata({ title, description }) {
  const { content } = usePortfolio();
  const { pathname } = useLocation();
  const site = settingValue(content.settings, 'siteName', 'Engineering Portfolio');
  const summary =
    description ||
    settingValue(
      content.settings,
      'siteDescription',
      content.profile?.shortIntro || 'Projects and engineering interests.',
    );
  useEffect(() => {
    document.title = title ? title + ' · ' + site : site;
    for (const [selector, text] of [
      ['meta[name="description"]', summary],
      ['meta[property="og:title"]', document.title],
      ['meta[property="og:description"]', summary],
    ]) {
      const element = document.querySelector(selector);
      if (element) element.setAttribute('content', text);
    }
    const url = safeUrl(settingValue(content.settings, 'siteUrl'));
    let canonical = document.querySelector('link[rel="canonical"]');
    if (url) {
      if (!canonical) {
        canonical = document.createElement('link');
        canonical.rel = 'canonical';
        document.head.appendChild(canonical);
      }
      canonical.href = new URL(pathname, url).href;
    } else canonical?.remove();
  }, [site, title, summary, pathname, content.settings]);
  return null;
}
