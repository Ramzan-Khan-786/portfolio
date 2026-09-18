import { ArrowUpRight } from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext.jsx';
import { settingValue } from '../lib/content.js';
import { ContentLink } from './Ui.jsx';
import './SiteFooter.css';
export default function SiteFooter() {
  const { content } = usePortfolio();
  return (
    <footer className="site-footer">
      <div className="shell footer-grid">
        <div>
          <strong>{content.profile?.name || 'Engineering Portfolio'}</strong>
          <p>{settingValue(content.settings, 'footerLine')}</p>
        </div>
        <nav aria-label="Social links">
          {content.socials.map((link) => (
            <ContentLink key={link._id} to={link.url}>
              {link.label}
              <ArrowUpRight size={14} />
            </ContentLink>
          ))}
        </nav>
        <small>© {new Date().getFullYear()} · Built with MERN</small>
      </div>
    </footer>
  );
}
