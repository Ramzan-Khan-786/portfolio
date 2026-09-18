import { ArrowUpRight, Github } from 'lucide-react';
import { Link } from 'react-router-dom';
import { usePortfolio } from '../context/PortfolioContext.jsx';
import { ContentImage, ContentLink, StatePanel } from './Ui.jsx';
import './WorkSection.css';
export default function WorkSection({ page = false }) {
  const {
    content: { projects },
  } = usePortfolio();
  const Heading = page ? 'h1' : 'h2';
  return (
    <section
      id="work"
      className="section-pad section-border scroll-mt-24"
      aria-labelledby="work-title"
    >
      <div className="shell">
        <div className="section-heading work-heading">
          <p className="eyebrow">Selected work</p>
          <Heading id="work-title">Projects with a clear reason to exist.</Heading>
          <p>
            A collection of software, experiments, and the problems that made them worth building.
          </p>
        </div>
        {projects.length ? (
          <div className="project-list">
            {projects.map((project, index) => (
              <article className="project-row" key={project._id}>
                <div className="project-index">{String(index + 1).padStart(2, '0')}</div>
                <div className="project-main">
                  <ContentImage
                    src={project.imageUrl}
                    alt={project.title + ' preview'}
                    loading="lazy"
                    className="project-cover"
                  />
                  <div className="project-title-line">
                    <h3>
                      <Link to={'/work/' + project.slug}>{project.title}</Link>
                    </h3>
                    <span className={'status status-' + project.status}>
                      {project.status?.replace('-', ' ')}
                    </span>
                    {project.featured && <span className="text-xs text-moss">Featured</span>}
                  </div>
                  <p>{project.summary}</p>
                  <div className="tag-list">
                    {project.technologies?.map((tech) => (
                      <span key={tech}>{tech}</span>
                    ))}
                  </div>
                  <Link
                    className="mt-4 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-moss"
                    to={'/work/' + project.slug}
                  >
                    Explore project <ArrowUpRight size={16} />
                  </Link>
                </div>
                <div className="project-meta">
                  <span>{project.year || 'Ongoing'}</span>
                  <div className="project-links">
                    <ContentLink to={project.githubUrl} aria-label={project.title + ' source'}>
                      <Github size={18} />
                    </ContentLink>
                    <ContentLink to={project.liveUrl} aria-label={project.title + ' live site'}>
                      <ArrowUpRight size={18} />
                    </ContentLink>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <StatePanel
            title="No projects published yet"
            message="New work will appear here when it is ready."
          />
        )}
      </div>
    </section>
  );
}
