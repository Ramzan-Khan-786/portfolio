import { usePortfolio } from '../context/PortfolioContext.jsx';
import PageHeading from './PageHeading.jsx';
import { ContentImage, StatePanel } from './Ui.jsx';
import './SkillsSection.css';
export default function SkillsSection() {
  const { content } = usePortfolio();
  const groups = Object.groupBy
    ? Object.groupBy(content.skills, (skill) => skill.category)
    : content.skills.reduce(
        (all, skill) => ({ ...all, [skill.category]: [...(all[skill.category] || []), skill] }),
        {},
      );
  return (
    <article className="shell pb-12">
      <PageHeading number="03" title="Technical toolkit">
        Languages, tools, and engineering practices I work with.
      </PageHeading>
      {content.skills.length ? (
        <div className="skills-ledger">
          {Object.entries(groups).map(([category, skills], index) => (
            <section className="skill-category" key={category}>
              <header>
                <span className="font-mono text-xs text-muted">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <h2>{category}</h2>
                <span className="skill-count">
                  {skills.length} {skills.length === 1 ? 'skill' : 'skills'}
                </span>
              </header>
              <ul>
                {skills.map((skill) => (
                  <li key={skill._id}>
                    <ContentImage src={skill.iconUrl} alt="" className="skill-icon" />
                    <div>
                      <h3>{skill.name}</h3>
                      {skill.description && <p>{skill.description}</p>}
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      ) : (
        <StatePanel
          title="Skills are being organized"
          message="Published skills will appear here."
        />
      )}
    </article>
  );
}
