import { ArrowUpRight, FileText, MapPin } from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext.jsx';
import { ContentImage, ContentLink, StatePanel } from './Ui.jsx';
import './ProfileSection.css';
export default function ProfileSection() {
  const {
    content: { profile, projects, skills },
  } = usePortfolio();
  if (!profile)
    return (
      <div className="shell">
        <StatePanel
          title="Profile coming together"
          message="Public profile information has not been published yet."
        />
      </div>
    );
  return (
    <section
      id="profile"
      className="profile-section section-pad scroll-mt-24"
      aria-labelledby="profile-title"
    >
      <div className="shell profile-layout">
        <div className="profile-kicker">
          <span className="pulse-dot" /> Software / Engineering
        </div>
        <div className="profile-copy">
          <p className="eyebrow">Hello, I’m {profile.name}.</p>
          <h1 id="profile-title">{profile.headline}</h1>
          <p className="profile-intro">{profile.shortIntro}</p>
          <div className="profile-actions">
            {profile.primaryCtaLabel && (
              <ContentLink to={profile.primaryCtaUrl} className="primary-action">
                {profile.primaryCtaLabel}
                <ArrowUpRight size={17} />
              </ContentLink>
            )}
            {profile.secondaryCtaLabel && (
              <ContentLink to={profile.secondaryCtaUrl} className="secondary-action">
                {profile.secondaryCtaLabel}
                <ArrowUpRight size={17} />
              </ContentLink>
            )}
            <ContentLink to={profile.resumeUrl} className="secondary-action">
              <FileText size={16} />
              Resume
            </ContentLink>
          </div>
          <div
            className="mt-8 flex flex-wrap gap-3 text-xs text-stone-500"
            aria-label="Core technologies"
          >
            {skills.slice(0, 5).map((skill) => (
              <span className="border-b border-line pb-1" key={skill._id}>
                {skill.name}
              </span>
            ))}
          </div>
        </div>
        <aside className="profile-aside" aria-label="Profile overview">
          <div className="profile-portrait">
            <ContentImage
              src={profile.profileImage}
              alt={profile.name}
              initials={profile.initials}
            />
          </div>
          <div className="profile-facts">
            {profile.location && (
              <p>
                <MapPin size={15} />
                {profile.location}
              </p>
            )}
            {profile.availability && (
              <p>
                <span className="availability-dot" />
                {profile.availability}
              </p>
            )}
            <p>
              <strong>{projects.length}</strong> published projects
            </p>
          </div>
        </aside>
      </div>
    </section>
  );
}
