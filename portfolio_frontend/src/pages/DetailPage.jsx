import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { apiClient } from '../lib/api.js';
import { ContentImage, ContentLink, StatePanel } from '../components/Ui.jsx';
import Metadata from '../components/Metadata.jsx';
import './DetailPage.css';
export function NotFound() {
  return (
    <div className="shell py-20">
      <Metadata title="Page not found" />
      <p className="eyebrow">404 / Not found</p>
      <h1 className="text-4xl font-medium tracking-tight">This page isn’t here.</h1>
      <p className="my-5 text-stone-600">It may have moved or hasn’t been published yet.</p>
      <Link to="/" className="primary-action">
        <ArrowLeft size={17} />
        Back to portfolio
      </Link>
    </div>
  );
}
export default function DetailPage({ type = 'project' }) {
  const { slug } = useParams();
  const [state, setState] = useState({ loading: true });
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    setState({ loading: true });
    apiClient[type === 'project' ? 'project' : 'page'](slug)
      .then((data) => {
        if (active) setState({ data });
      })
      .catch((error) => {
        if (active) setState({ error });
      });
    return () => {
      active = false;
    };
  }, [slug, type, attempt]);
  if (state.loading) return <StatePanel title="Loading details" loading />;
  if (state.error?.status === 404) return <NotFound />;
  if (state.error)
    return (
      <StatePanel
        title="Unable to load this page"
        message={state.error.message}
        retry={() => setAttempt(attempt + 1)}
      />
    );
  const item = state.data;
  return (
    <article className="detail-page shell py-12 sm:py-20">
      <Metadata title={item.title} description={item.summary || item.description} />
      <Link
        to={type === 'project' ? '/work' : '/'}
        className="mb-8 inline-flex min-h-11 items-center gap-2 text-sm text-moss"
      >
        <ArrowLeft size={17} />
        {type === 'project' ? 'All projects' : 'Back to portfolio'}
      </Link>
      <p className="eyebrow">
        {item.category || (type === 'project' ? 'Project' : 'Profile / Notes')}
        {item.year ? ' / ' + item.year : ''}
      </p>
      <h1 className="max-w-4xl text-4xl font-medium leading-tight tracking-tight sm:text-6xl">
        {item.title}
      </h1>
      <p className="my-6 max-w-3xl text-lg leading-relaxed text-stone-600">
        {item.summary || item.description}
      </p>
      {type === 'project' && (
        <>
          <span className="status">{item.status?.replace('-', ' ')}</span>
          <ContentImage src={item.imageUrl} alt={item.title + ' cover'} className="detail-cover" />
          <div className="my-6 flex flex-wrap gap-2">
            {item.technologies?.map((tech) => (
              <span
                key={tech}
                className="rounded-full border border-line px-3 py-1 font-mono text-xs"
              >
                {tech}
              </span>
            ))}
          </div>
        </>
      )}
      <div className="max-w-3xl whitespace-pre-line text-base leading-8 text-stone-700">
        {type === 'project' ? item.description : item.body}
      </div>
      {type === 'project' && (
        <>
          <div className="my-8 flex flex-wrap gap-3">
            <ContentLink to={item.githubUrl} className="secondary-action">
              View source ↗
            </ContentLink>
            <ContentLink to={item.liveUrl} className="primary-action">
              Open project ↗
            </ContentLink>
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            {item.screenshots?.map((url, index) => (
              <ContentImage
                key={url}
                src={url}
                loading="lazy"
                alt={item.title + ' screenshot ' + (index + 1)}
                className="w-full rounded-md border border-line"
              />
            ))}
          </div>
        </>
      )}
    </article>
  );
}
