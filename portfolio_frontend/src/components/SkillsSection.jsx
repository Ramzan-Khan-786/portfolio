import { useMemo } from 'react';
import { usePortfolio } from '../context/PortfolioContext.jsx';
import './SkillsSection.css';

export default function SkillsSection({ page = false }) {
  const { content } = usePortfolio();
  const Heading = page ? 'h1' : 'h2';
  const groups = useMemo(
    () =>
      content.skills.reduce((accumulator, skill) => {
        (accumulator[skill.category] ||= []).push(skill);
        return accumulator;
      }, {}),
    [content.skills],
  );
  return (
    <section
      id="skills"
      className="section-pad section-border scroll-mt-24"
      aria-labelledby="skills-title"
    >
      <div className="shell">
        <div className="section-heading">
          <p className="eyebrow">Capabilities</p>
          <Heading id="skills-title">Tools are useful when they serve the system.</Heading>
          <p>Focused on the practical end-to-end work required to ship and sustain a product.</p>
        </div>
        {!content.skills.length && (
          <p className="empty-state">No skills have been published yet.</p>
        )}
        <div className="skill-matrix">
          {Object.entries(groups).map(([category, skills]) => (
            <article key={category} className="skill-group">
              <h3>{category}</h3>
              <ul>
                {skills.map((skill) => (
                  <li key={skill._id}>
                    <span>{skill.name}</span>
                    <small>{skill.description}</small>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
