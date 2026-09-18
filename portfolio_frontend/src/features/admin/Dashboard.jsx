import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../../lib/api.js';
import { StatePanel } from '../../components/Ui.jsx';
export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    setError('');
    apiClient
      .dashboard()
      .then((data) => {
        if (active) setStats(data);
      })
      .catch((failure) => {
        if (active) setError(failure.message);
      });
    return () => {
      active = false;
    };
  }, [attempt]);
  return (
    <section>
      <div className="cms-page-heading">
        <div>
          <p className="eyebrow">Workspace overview</p>
          <h1>Your portfolio, in one place.</h1>
          <p>Keep your profile current and bring your latest work into view.</p>
        </div>
      </div>
      {error ? (
        <StatePanel
          title="Unable to load overview"
          message={error}
          retry={() => setAttempt(attempt + 1)}
        />
      ) : !stats ? (
        <StatePanel loading title="Loading overview" />
      ) : (
        <>
          <div className="grid gap-px overflow-hidden rounded-md border border-line bg-line sm:grid-cols-2 xl:grid-cols-4">
            {[
              ['Published projects', stats.liveProjects, 'projects'],
              ['Showroom items', stats.showroom, 'showroom'],
              ['Visible skills', stats.skills, 'skills'],
              ['Navigation items', stats.navigation, 'navigation'],
            ].map(([label, number, route]) => (
              <Link key={label} to={'/admin/' + route} className="bg-white p-6 hover:bg-stone-50">
                <strong className="block text-4xl font-medium tracking-tight text-moss">
                  {number}
                </strong>
                <span className="mt-3 block text-sm text-stone-600">{label}</span>
              </Link>
            ))}
          </div>
          <div className="cms-editor mt-6">
            <h2 className="mb-4 text-lg font-semibold">Recently updated projects</h2>
            {stats.recent?.length ? (
              <ul className="divide-y divide-line">
                {stats.recent.map((project) => (
                  <li
                    key={project._id}
                    className="flex flex-wrap items-center justify-between gap-2 py-4"
                  >
                    <Link className="text-sm font-medium text-moss underline" to="/admin/projects">
                      {project.title}
                    </Link>
                    <span className="font-mono text-xs text-stone-500">
                      {project.published ? 'Published' : 'Draft'} ·{' '}
                      {new Date(project.updatedAt).toLocaleDateString()}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-stone-600">Create your first project to begin.</p>
            )}
          </div>
        </>
      )}
    </section>
  );
}
