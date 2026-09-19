import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, ArrowUpRight, Github, FlaskConical } from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext.jsx';
import { ContentLink, StatePanel } from './Ui.jsx';
import EmbeddedProject from '../features/showroom/EmbeddedProject.jsx';
import './Showroom.css';
export function getShowroomMotion(previous, next) {
  return next >= previous ? 'from-right' : 'from-left';
}
function Presentation({ item }) {
  return item.status === 'coming-soon' || item.presentationType === 'coming-soon' ? (
    <div className="showroom-message">
      <FlaskConical size={27} />
      <p className="eyebrow">Coming soon</p>
      <h2>{item.label}</h2>
      <p>
        {item.description ||
          'This experience is in development. It will be available here when it is ready.'}
      </p>
    </div>
  ) : (
    <EmbeddedProject item={item} />
  );
}
export default function Showroom() {
  const {
    content: { showroom: items },
  } = usePortfolio();
  const [selected, setSelected] = useState(null),
    [leaving, setLeaving] = useState(null),
    [motion, setMotion] = useState('from-right');
  const timer = useRef(null),
    tabs = useRef([]),
    active =
      items.find((item) => item._id === selected) ||
      items.find((item) => item.isDefault) ||
      items[0],
    index = items.indexOf(active);
  useEffect(() => () => clearTimeout(timer.current), []);
  function select(next, focus = false) {
    if (!items[next]) return;
    if (items[next]._id !== active?._id) {
      clearTimeout(timer.current);
      setLeaving(window.matchMedia('(prefers-reduced-motion: reduce)').matches ? null : active);
      setMotion(getShowroomMotion(index, next));
      setSelected(items[next]._id);
      timer.current = setTimeout(() => setLeaving(null), 340);
    }
    if (focus) tabs.current[next]?.focus();
    tabs.current[next]?.scrollIntoView?.({ block: 'nearest', inline: 'nearest' });
  }
  function keyDown(event, position) {
    const next =
      event.key === 'ArrowRight'
        ? (position + 1) % items.length
        : event.key === 'ArrowLeft'
          ? (position - 1 + items.length) % items.length
          : event.key === 'Home'
            ? 0
            : event.key === 'End'
              ? items.length - 1
              : null;
    if (next !== null) {
      event.preventDefault();
      select(next, true);
    }
  }
  return (
    <section className="showroom-page" data-scroll-lock aria-labelledby="showroom-title">
      <header className="showroom-heading">
        <div className="flex items-center gap-4">
          <span className="eyebrow m-0">05 / Live environment</span>
          <h1 id="showroom-title">Engineering showroom</h1>
        </div>
        <span className="showroom-hint">Use the application. Explore the implementation.</span>
      </header>
      <div className="project-selector" role="tablist" aria-label="Showroom projects">
        {items.map((item, position) => (
          <button
            key={item._id}
            ref={(node) => {
              tabs.current[position] = node;
            }}
            id={'tab-' + item._id}
            role="tab"
            tabIndex={position === index ? 0 : -1}
            aria-selected={position === index}
            aria-controls={'panel-' + item._id}
            onClick={() => select(position)}
            onKeyDown={(event) => keyDown(event, position)}
          >
            <span>{String(position + 1).padStart(2, '0')}</span>
            {item.label}
            {item.status === 'coming-soon' && <small>soon</small>}
          </button>
        ))}
      </div>
      {active ? (
        <>
          <div className={'showroom-window ' + motion}>
            {leaving && leaving._id !== active._id && (
              <div
                key={leaving._id}
                className="showroom-panel outgoing"
                inert=""
                aria-hidden="true"
              >
                <Presentation item={leaving} />
              </div>
            )}
            <div
              key={active._id}
              id={'panel-' + active._id}
              role="tabpanel"
              aria-labelledby={'tab-' + active._id}
              tabIndex="0"
              className={'showroom-panel ' + (leaving ? 'incoming' : '')}
            >
              <Presentation item={active} />
            </div>
          </div>
          <div className="showroom-caption">
            <div>
              <h2>{active.label}</h2>
              <p>{active.description || active.project?.summary}</p>
              <span className="showroom-tech">
                {(active.technologies?.length
                  ? active.technologies
                  : active.project?.technologies
                )?.join(' / ')}
              </span>
            </div>
            <div className="showroom-links">
              <ContentLink to={active.externalUrl || active.project?.liveUrl || active.embedUrl}>
                Open live project
                <ArrowUpRight size={15} />
              </ContentLink>
              <ContentLink
                to={active.githubUrl || active.project?.githubUrl}
                aria-label={'GitHub for ' + active.label}
              >
                <Github size={17} />
                <span>Source</span>
              </ContentLink>
              <div className="showroom-step">
                <button
                  aria-label="Previous project"
                  disabled={index === 0}
                  onClick={() => select(index - 1)}
                >
                  <ArrowLeft size={16} />
                </button>
                <button
                  aria-label="Next project"
                  disabled={index === items.length - 1}
                  onClick={() => select(index + 1)}
                >
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </>
      ) : (
        <StatePanel
          title="The showroom is quiet for now"
          message="Enabled interactive experiences will appear here."
        />
      )}
    </section>
  );
}
