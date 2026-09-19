import { MapPin, ArrowUpRight } from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext.jsx';
import { ContentImage, ContentLink, StatePanel } from '../components/Ui.jsx';
import PageHeading from '../components/PageHeading.jsx';
import Metadata from '../components/Metadata.jsx';
import './ProfilePage.css';
export function Timeline({ entries = [], empty }) {
  return entries.length ? (
    <ol className="profile-timeline">
      {entries.map((entry, index) => (
        <li key={entry.title + index}>
          <span className="timeline-period">{entry.period}</span>
          <div>
            <h3>{entry.title}</h3>
            {entry.organization && <p className="timeline-org">{entry.organization}</p>}
            {entry.description && <p>{entry.description}</p>}
          </div>
        </li>
      ))}
    </ol>
  ) : empty ? (
    <p className="text-sm text-secondary">{empty}</p>
  ) : null;
}
export default function ProfilePage() {
  const { content } = usePortfolio(),
    profile = content.profile,
    details = content.sections?.profile || {};
  if (!profile || details.visible === false) return <StatePanel title="Profile unavailable" />;
  return (
    <article className="shell pb-12">
      <Metadata title="Profile" />
      <PageHeading number="02" title={details.title || 'Profile'}>
        The person behind the projects.
      </PageHeading>
      <div className="profile-dossier">
        <aside className="profile-identity">
          <div className="dossier-avatar">
            <ContentImage
              src={profile.profileImage}
              initials={profile.initials}
              alt={profile.name}
            />
          </div>
          <h2>{profile.name}</h2>
          {profile.location && (
            <p className="flex items-center gap-2 text-sm text-secondary">
              <MapPin size={14} />
              {profile.location}
            </p>
          )}
          {profile.availability && (
            <p className="mt-4 text-sm text-secondary">{profile.availability}</p>
          )}
          <ContentLink to="/resume" className="secondary-action mt-6">
            View resume
            <ArrowUpRight size={15} />
          </ContentLink>
        </aside>
        <div className="profile-record">
          <section>
            <p className="eyebrow">Introduction</p>
            <p className="dossier-intro">{details.introduction || profile.shortIntro}</p>
          </section>
          <section>
            <p className="eyebrow">Technical focus</p>
            <ul className="dossier-focus">
              {profile.focusAreas?.map((area) => (
                <li key={area}>{area}</li>
              ))}
            </ul>
          </section>
          {details.currentFocus && (
            <section>
              <p className="eyebrow">Working on now</p>
              <p className="text-sm leading-7 text-secondary">{details.currentFocus}</p>
            </section>
          )}
          {details.education?.length > 0 && (
            <section>
              <p className="eyebrow">Education</p>
              <Timeline entries={details.education} />
            </section>
          )}
          {details.highlights?.length > 0 && (
            <section>
              <p className="eyebrow">Highlights</p>
              <ul className="dossier-focus">
                {details.highlights.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>
          )}
          {details.interests?.length > 0 && (
            <section>
              <p className="eyebrow">Beyond the editor</p>
              <p className="text-sm leading-7 text-secondary">{details.interests.join(' · ')}</p>
            </section>
          )}
        </div>
      </div>
    </article>
  );
}
