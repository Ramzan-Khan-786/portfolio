import { ArrowUpRight, Mail } from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext.jsx';
import { settingValue } from '../lib/content.js';
import { ContentLink, StatePanel } from './Ui.jsx';
import './AboutContact.css';
export function AboutSection({ page = false }) {
  const {
    content: { profile },
  } = usePortfolio();
  const Heading = page ? 'h1' : 'h2';
  return (
    <section
      id="about"
      className="section-pad section-border scroll-mt-24"
      aria-labelledby="about-title"
    >
      <div className="shell about-layout">
        <div>
          <p className="eyebrow">About / approach</p>
          <Heading id="about-title">Build the useful thing, then make it easier to trust.</Heading>
        </div>
        <div>
          {profile?.bio ? (
            <p className="about-bio whitespace-pre-line">{profile.bio}</p>
          ) : (
            <p>More about my engineering journey will be shared here.</p>
          )}
          <ul className="focus-list">
            {profile?.focusAreas?.map((area) => (
              <li key={area}>{area}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
export function ContactSection({ page = false }) {
  const { content } = usePortfolio();
  const email = settingValue(content.settings, 'contactEmail');
  const Heading = page ? 'h1' : 'h2';
  return (
    <section
      id="contact"
      className="contact-section section-pad scroll-mt-24"
      aria-labelledby="contact-title"
    >
      <div className="shell contact-layout">
        <div>
          <p className="eyebrow">Let’s talk</p>
          <Heading id="contact-title">Have a system worth talking about?</Heading>
        </div>
        <div>
          <p>
            For collaborations, engineering conversations, or work opportunities, a concise note is
            the best place to start.
          </p>
          {email && (
            <ContentLink to={'mailto:' + email} className="contact-email">
              <Mail size={18} />
              {email}
              <ArrowUpRight size={17} />
            </ContentLink>
          )}
          <div className="mt-5 flex flex-wrap gap-3">
            {content.socials.map((link) => (
              <ContentLink key={link._id} to={link.url} className="secondary-action">
                {link.label}
                <ArrowUpRight size={16} />
              </ContentLink>
            ))}
          </div>
          {!email && !content.socials.length && (
            <StatePanel
              title="Contact details coming soon"
              message="Public contact channels have not been configured yet."
            />
          )}
        </div>
      </div>
    </section>
  );
}
