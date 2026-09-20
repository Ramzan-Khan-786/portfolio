import { ArrowUpRight, Mail } from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext.jsx';
import { settingValue } from '../lib/content.js';
import { ContentImage, ContentLink, StatePanel } from './Ui.jsx';
import PageHeading from './PageHeading.jsx';
import { Timeline } from '../pages/ProfilePage.jsx';
import './AboutContact.css';
export function AboutSection() {
  const { content } = usePortfolio(),
    about = content.sections?.about || {};
  if (about.visible === false) return <StatePanel title="About page unavailable" />;
  return (
    <article className="shell pb-12">
      <PageHeading number="07" title={about.title || 'About'}>
        {about.subtitle || 'Background, interests, and how I approach engineering.'}
      </PageHeading>
      <div className="about-composition">
        <aside>
          {about.imageMedia?.url && (
            <figure className="mb-6">
              <ContentImage
                src={about.imageMedia.url}
                alt={about.imageMedia.altText || 'About the developer'}
                loading="lazy"
                className="w-full rounded border border-line"
              />
              {about.imageMedia.caption && (
                <figcaption className="text-xs text-muted mt-2">
                  {about.imageMedia.caption}
                </figcaption>
              )}
            </figure>
          )}
          <p className="eyebrow">In my own words</p>
          <h2>{about.heading || 'A little more context.'}</h2>
          {content.profile?.focusAreas?.length > 0 && (
            <ul>
              {content.profile.focusAreas.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          )}
        </aside>
        <div className="about-story">
          <div className="about-prose">
            {about.body || content.profile?.bio || 'More background will be added here.'}
          </div>
          {about.principles?.length > 0 && (
            <section>
              <p className="eyebrow">How I work</p>
              <ol>
                {about.principles.map((item, index) => (
                  <li key={item}>
                    <span>{String(index + 1).padStart(2, '0')}</span>
                    {item}
                  </li>
                ))}
              </ol>
            </section>
          )}
          {about.experience?.length > 0 && (
            <section>
              <p className="eyebrow">Experience</p>
              <Timeline entries={about.experience} />
            </section>
          )}
        </div>
      </div>
    </article>
  );
}
export function ContactSection() {
  const { content } = usePortfolio(),
    contact = content.sections?.contact || {},
    email = contact.email || settingValue(content.settings, 'contactEmail');
  if (contact.visible === false) return <StatePanel title="Contact page unavailable" />;
  return (
    <article className="shell contact-page">
      <PageHeading number="08" title={contact.title || 'Contact'}>
        {contact.subtitle || 'For engineering opportunities and thoughtful conversations.'}
      </PageHeading>
      <div className="contact-composition">
        <div>
          <p className="eyebrow">Get in touch</p>
          <h2>{contact.heading || 'Let’s talk.'}</h2>
          <p className="contact-description">
            {contact.description ||
              'A concise introduction and a little context are a good place to start.'}
          </p>
          {email && contact.showEmail !== false && (
            <ContentLink to={'mailto:' + email} className="contact-primary">
              <Mail size={20} />
              <span>{email}</span>
              <ArrowUpRight size={23} />
            </ContentLink>
          )}
          {contact.ctaLabel && (
            <ContentLink to={contact.ctaUrl} className="secondary-action mt-6">
              {contact.ctaLabel}
              <ArrowUpRight size={16} />
            </ContentLink>
          )}
        </div>
        <nav className="contact-links" aria-label="Contact channels">
          {contact.showSocials !== false &&
            content.socials.map((link, index) => (
              <ContentLink to={link.url} key={link._id}>
                <span className="font-mono text-xs text-muted">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span>{link.label}</span>
                <ArrowUpRight size={19} />
              </ContentLink>
            ))}
          {!email && !content.socials.length && (
            <p className="text-sm text-secondary">Contact details haven’t been published yet.</p>
          )}
          {contact.note && <p className="contact-note">{contact.note}</p>}
        </nav>
      </div>
    </article>
  );
}
