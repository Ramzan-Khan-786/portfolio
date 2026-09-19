import { useEffect, useState } from 'react';
import { Download, ExternalLink, FileText } from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext.jsx';
import { apiClient, assetUrl } from '../lib/api.js';
import { safeUrl } from '../lib/content.js';
import { ContentLink, StatePanel } from '../components/Ui.jsx';
import Metadata from '../components/Metadata.jsx';
import PageHeading from '../components/PageHeading.jsx';
import { Timeline } from './ProfilePage.jsx';
import './ResumePage.css';
export default function ResumePage() {
  const { content } = usePortfolio();
  const [state, setState] = useState({ loading: true }),
    [attempt, setAttempt] = useState(0),
    [preview, setPreview] = useState(false);
  useEffect(() => {
    let active = true;
    apiClient
      .resume()
      .then((resume) => {
        if (active) setState({ resume });
      })
      .catch((error) => {
        if (active) setState({ error });
      });
    return () => {
      active = false;
    };
  }, [attempt]);
  if (state.loading) return <StatePanel loading title="Loading resume" />;
  if (state.error)
    return (
      <StatePanel
        title="Resume unavailable"
        message={state.error.message}
        retry={() => setAttempt(attempt + 1)}
      />
    );
  const resume = state.resume;
  if (resume?.visible === false) return <StatePanel title="Resume not currently published" />;
  const file = resume?.hasFile
    ? assetUrl('/public/resume/file')
    : safeUrl(resume?.externalUrl || content.profile?.resumeUrl);
  const details = content.sections?.profile || {},
    about = content.sections?.about || {};
  return (
    <article className="shell pb-12">
      <Metadata title="Resume" />
      <PageHeading number="06" title={resume?.title || 'Resume'}>
        {resume?.description ||
          'Professional background, technical experience, and a copy to keep.'}
      </PageHeading>
      <div className="resume-layout">
        <aside className="resume-summary">
          <div className="resume-document-mark">
            <FileText size={36} strokeWidth={1} />
            <span>PDF / RESUME</span>
          </div>
          <h2>{content.profile?.name}</h2>
          {resume?.lastUpdated && (
            <p className="text-xs text-muted mt-2">
              Updated{' '}
              {new Date(resume.lastUpdated + 'T12:00:00').toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          )}
          {file ? (
            <div className="grid gap-3 mt-6">
              <a href={file} target="_blank" rel="noopener noreferrer" className="primary-action">
                View resume
                <ExternalLink size={15} />
              </a>
              {resume?.downloadEnabled !== false && (
                <a
                  href={resume?.hasFile ? file + '?download=1' : file}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                  className="secondary-action"
                >
                  Download resume
                  <Download size={15} />
                </a>
              )}
              <button
                className="resume-preview-toggle"
                aria-expanded={preview}
                onClick={() => setPreview(!preview)}
              >
                {preview ? 'Hide document preview' : 'Preview document here'}
              </button>
            </div>
          ) : (
            <p className="resume-file-empty">
              A downloadable resume hasn’t been published yet. Available background is listed
              alongside.
            </p>
          )}
          {resume?.links?.length > 0 && (
            <nav className="resume-related" aria-label="Resume links">
              {resume.links.map((link) => (
                <ContentLink key={link.url} to={link.url}>
                  {link.label}
                  <ExternalLink size={13} />
                </ContentLink>
              ))}
            </nav>
          )}
        </aside>
        <div className="resume-content">
          {preview && file && (
            <section className="resume-preview" data-scroll-lock>
              <iframe src={file} title="Resume PDF preview" />
              <p>
                PDF previews depend on your browser.{' '}
                <a href={file} target="_blank" rel="noopener noreferrer">
                  Open the original document ↗
                </a>
              </p>
            </section>
          )}
          {details.education?.length > 0 && (
            <section>
              <h2>Education</h2>
              <Timeline entries={details.education} />
            </section>
          )}
          {about.experience?.length > 0 && (
            <section>
              <h2>Experience</h2>
              <Timeline entries={about.experience} />
            </section>
          )}
          {content.skills.length > 0 && (
            <section>
              <h2>Technical skills</h2>
              <div className="resume-skill-list">
                {content.skills.map((skill) => (
                  <span key={skill._id}>{skill.name}</span>
                ))}
              </div>
            </section>
          )}
          {details.achievements?.length > 0 && (
            <section>
              <h2>Achievements</h2>
              <ul className="list-disc pl-5 space-y-2 text-sm text-secondary">
                {details.achievements.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>
          )}
          {content.projects.length > 0 && (
            <section>
              <h2>Projects</h2>
              {content.projects.slice(0, 4).map((project) => (
                <div className="resume-project" key={project._id}>
                  <ContentLink to={'/work/' + project.slug}>{project.title} ↗</ContentLink>
                  <p>{project.summary}</p>
                </div>
              ))}
            </section>
          )}
          {!file &&
            !content.skills.length &&
            !content.projects.length &&
            !details.education?.length &&
            !about.experience?.length && <StatePanel title="Resume details coming soon" />}
        </div>
      </div>
    </article>
  );
}
