import { Component, useState } from 'react';
import { Link } from 'react-router-dom';
import { safeUrl } from '../lib/content.js';
import './Ui.css';

export function ContentLink({ to, children, ...props }) {
  const href = safeUrl(to, { internal: true, email: true });
  if (!href) return null;
  if (href.startsWith('/') || href.startsWith('#'))
    return (
      <Link to={href.startsWith('#') ? '/' + href : href} {...props}>
        {children}
      </Link>
    );
  return (
    <a
      href={href}
      target={href.startsWith('mailto:') ? undefined : '_blank'}
      rel="noopener noreferrer"
      {...props}
    >
      {children}
    </a>
  );
}
export function ContentImage({ src, alt, className = '', initials = '', ...props }) {
  const [failedSrc, setFailedSrc] = useState(null);
  return safeUrl(src) && failedSrc !== src ? (
    <img src={src} alt={alt} className={className} onError={() => setFailedSrc(src)} {...props} />
  ) : initials ? (
    <span className={className} aria-label={alt}>
      {initials}
    </span>
  ) : null;
}
export function StatePanel({ title, message, retry, loading = false }) {
  return (
    <div className="state-panel" role={loading ? 'status' : undefined}>
      {loading && <span className="loading-indicator" aria-hidden="true" />}
      <h2>{title}</h2>
      {message && <p>{message}</p>}
      {retry && (
        <button className="primary-action" onClick={retry}>
          Try again
        </button>
      )}
    </div>
  );
}
export class ErrorBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? (
      <main className="shell py-20">
        <StatePanel
          title="Something went wrong"
          message="Please reload to return to the portfolio."
          retry={() => window.location.reload()}
        />
      </main>
    ) : (
      this.props.children
    );
  }
}
