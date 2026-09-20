import { ArrowLeft, ArrowRight, Mouse } from 'lucide-react';
import { Link } from 'react-router-dom';
import { usePortfolio } from '../context/PortfolioContext.jsx';
import { ContentLink } from './Ui.jsx';
import './SiteFooter.css';
export default function SiteFooter({
  previous,
  next,
  position,
  total,
  scrollEnabled,
  toggleScroll,
  reduced,
}) {
  const { content } = usePortfolio();
  const footer = content.sections?.footer || {};
  return (
    <footer className="site-footer">
      <div className="footer-identity">
        {footer.showCopyright !== false &&
          (footer.copyright ||
            '© ' + new Date().getFullYear() + ' ' + (content.profile?.name || 'Portfolio'))}
      </div>
      <nav className="footer-socials" aria-label="Social links">
        {footer.showSocials !== false &&
          content.socials.slice(0, 3).map((link) => (
            <ContentLink key={link._id} to={link.url}>
              {link.label} ↗
            </ContentLink>
          ))}
        {footer.links
          ?.filter((link) => link.visible !== false)
          .slice(0, 2)
          .map((link) => (
            <ContentLink key={link.url} to={link.url}>
              {link.label} ↗
            </ContentLink>
          ))}
      </nav>
      <div className="page-navigation">
        <button
          className="scroll-toggle"
          disabled={reduced}
          onClick={toggleScroll}
          aria-pressed={scrollEnabled}
          title={
            reduced
              ? 'Scroll navigation is off for reduced motion'
              : 'Toggle scroll-to-next-page navigation'
          }
          aria-label="Scroll navigation"
        >
          <Mouse size={14} />
          <span>{scrollEnabled ? 'Scroll to explore' : 'Scroll navigation off'}</span>
        </button>
        {position && (
          <span className="page-count">
            {position}
            <span> / {String(total).padStart(2, '0')}</span>
          </span>
        )}
        <Link
          className={!previous ? 'page-arrow disabled' : 'page-arrow'}
          to={previous?.destination || '#'}
          state={{ pageDirection: -1 }}
          aria-label={previous ? 'Previous page: ' + previous.label : 'No previous page'}
          aria-disabled={!previous}
          tabIndex={previous ? 0 : -1}
          onClick={(event) => {
            if (!previous) event.preventDefault();
          }}
        >
          <ArrowLeft size={17} />
        </Link>
        <Link
          className={!next ? 'page-arrow disabled' : 'page-arrow'}
          to={next?.destination || '#'}
          state={{ pageDirection: 1 }}
          aria-label={next ? 'Next page: ' + next.label : 'No next page'}
          aria-disabled={!next}
          tabIndex={next ? 0 : -1}
          onClick={(event) => {
            if (!next) event.preventDefault();
          }}
        >
          <ArrowRight size={17} />
        </Link>
      </div>
    </footer>
  );
}
