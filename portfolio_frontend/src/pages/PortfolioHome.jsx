import { ArrowUpRight, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { usePortfolio } from '../context/PortfolioContext.jsx';
import { ContentImage, ContentLink, StatePanel } from '../components/Ui.jsx';
import Metadata from '../components/Metadata.jsx';
import './PortfolioHome.css';
export default function PortfolioHome() {
  const { content } = usePortfolio(),
    profile = content.profile,
    hero = content.sections?.hero || {};
  if (!profile || hero.visible === false)
    return (
      <StatePanel
        title="Introduction unavailable"
        message="Explore the other pages using the navigation."
      />
    );
  const featured = content.projects.filter((item) => item.featured).slice(0, 2);
  const actions = hero.actions?.length
    ? hero.actions
    : [
        { label: profile.primaryCtaLabel, url: profile.primaryCtaUrl },
        { label: profile.secondaryCtaLabel, url: profile.secondaryCtaUrl },
      ];
  return (
    <article className="home-page shell">
      <Metadata title="Home" />
      <div className="home-topline">
        <span className="eyebrow">{hero.eyebrow || 'Software / Engineering'}</span>
        {profile.availability && (
          <span className="availability">
            <i />
            {profile.availability}
          </span>
        )}
      </div>
      <div className="home-composition">
        <div className="home-intro">
          <p className="home-greeting">{hero.greeting || 'Hello, I’m'}</p>
          <h1>
            {profile.name}
            <span className="name-period">.</span>
          </h1>
          <h2>{hero.headline || profile.headline}</h2>
          <p className="home-description">{hero.introduction || profile.shortIntro}</p>
          <div className="flex flex-wrap gap-3 mt-7">
            {actions
              .filter((action) => action.label)
              .map((action, index) => (
                <ContentLink
                  key={action.label + index}
                  className={index === 0 ? 'primary-action' : 'secondary-action'}
                  to={action.url}
                >
                  {action.label}
                  <ArrowUpRight size={16} />
                </ContentLink>
              ))}
          </div>
        </div>
        <aside className="home-aside">
          <div className="home-portrait">
            <ContentImage
              src={hero.imageUrl || profile.profileImage}
              alt={profile.name}
              initials={profile.initials || 'RK'}
            />
            <span className="portrait-caption">{profile.location || 'Engineering portfolio'}</span>
          </div>
          <div className="home-focus">
            <p className="eyebrow">Current focus</p>
            {profile.focusAreas?.map((area) => (
              <span key={area}>
                <span className="focus-mark">/</span>
                {area}
              </span>
            ))}
          </div>
        </aside>
      </div>
      <div className="home-bottom">
        <section className="home-selected">
          <div className="flex items-center justify-between gap-4 mb-4">
            <p className="eyebrow m-0">Selected work</p>
            <Link
              className="text-xs text-secondary min-h-11 inline-flex items-center gap-2"
              to="/work"
            >
              All work
              <ArrowRight size={14} />
            </Link>
          </div>
          {featured.length ? (
            featured.map((project, index) => (
              <Link className="home-project" key={project._id} to={'/work/' + project.slug}>
                <span className="font-mono text-xs text-muted">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span>
                  <strong>{project.title}</strong>
                  <small>{project.category || project.technologies?.slice(0, 3).join(' / ')}</small>
                </span>
                <ArrowUpRight size={18} />
              </Link>
            ))
          ) : (
            <p className="text-sm text-secondary">
              Featured projects will appear here when published.
            </p>
          )}
        </section>
        <section className="home-stack">
          <p className="eyebrow">Tools I work with</p>
          <div className="flex flex-wrap gap-x-5 gap-y-3">
            {content.skills.slice(0, 8).map((skill) => (
              <span key={skill._id}>{skill.name}</span>
            ))}
          </div>
          <Link to="/skills" className="home-index-link">
            {content.projects.length} published{' '}
            {content.projects.length === 1 ? 'project' : 'projects'}
            <span>/</span>
            {content.skills.length} technical skills
            <ArrowUpRight size={14} />
          </Link>
        </section>
      </div>
    </article>
  );
}
