import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Github } from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext.jsx';
import { ContentImage, ContentLink, StatePanel } from './Ui.jsx';
import PageHeading from './PageHeading.jsx';
import './WorkSection.css';
export default function WorkSection() {
  const {
    content: { projects },
  } = usePortfolio();
  const [filter, setFilter] = useState('All');
  const categories = ['All', ...new Set(projects.map((item) => item.category).filter(Boolean))];
  const visible = projects.filter((item) => filter === 'All' || item.category === filter);
  return (
    <article className="shell pb-12">
      <PageHeading number="04" title="Selected work">
        A catalogue of projects: what they do, how they’re built, and where to find them.
      </PageHeading>
      {categories.length > 1 && (
        <div className="work-filters" aria-label="Filter projects">
          {categories.map((category) => (
            <button
              key={category}
              aria-pressed={filter === category}
              onClick={() => setFilter(category)}
            >
              {category}
            </button>
          ))}
        </div>
      )}
      {visible.length ? (
        <div className="work-list">
          {visible.map((project, index) => (
            <article className="work-entry" key={project._id}>
              <div className="work-entry-index">
                {String(index + 1).padStart(2, '0')}
                <span>{project.year || '—'}</span>
              </div>
              <div className="work-entry-main">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                  <h2>
                    <Link to={'/work/' + project.slug}>{project.title}</Link>
                  </h2>
                  <span className="status">{project.status?.replace('-', ' ')}</span>
                </div>
                <p>{project.summary}</p>
                <div className="work-technologies">
                  {project.technologies?.map((tech) => (
                    <span key={tech}>{tech}</span>
                  ))}
                </div>
                <div className="flex flex-wrap items-center gap-6 mt-6">
                  <Link className="work-detail-link" to={'/work/' + project.slug}>
                    Explore project
                    <ArrowUpRight size={16} />
                  </Link>
                  <ContentLink
                    className="work-icon-link"
                    to={project.githubUrl}
                    aria-label={'Source code for ' + project.title}
                  >
                    <Github size={17} />
                  </ContentLink>
                  <ContentLink
                    className="work-icon-link"
                    to={project.liveUrl}
                    aria-label={'Live ' + project.title}
                  >
                    <ArrowUpRight size={18} />
                  </ContentLink>
                </div>
              </div>
              {project.imageUrl && (
                <ContentImage
                  src={project.imageUrl}
                  loading="lazy"
                  alt={project.title + ' preview'}
                  className="work-preview"
                />
              )}
            </article>
          ))}
        </div>
      ) : (
        <StatePanel title="No published projects here yet" message="Check back for new work." />
      )}
    </article>
  );
}
