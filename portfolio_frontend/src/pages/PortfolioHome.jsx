import ProfileSection from '../components/ProfileSection.jsx';
import SkillsSection from '../components/SkillsSection.jsx';
import WorkSection from '../components/WorkSection.jsx';
import { AboutSection, ContactSection } from '../components/AboutContact.jsx';
import Metadata from '../components/Metadata.jsx';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
export default function PortfolioHome() {
  return (
    <>
      <Metadata />
      <ProfileSection />
      <WorkSection />
      <section id="showroom" className="bg-moss py-16 text-white">
        <div className="shell grid gap-6 md:grid-cols-2 md:items-center">
          <div>
            <p className="mb-3 font-mono text-xs uppercase tracking-widest text-green-200">
              Engineering showroom
            </p>
            <h2 className="text-3xl font-medium tracking-tight sm:text-4xl">
              See the work in motion.
            </h2>
          </div>
          <div>
            <p className="mb-5 max-w-md leading-relaxed text-green-100">
              A dedicated space to interact with selected projects and explore what’s being built
              next.
            </p>
            <Link
              className="inline-flex min-h-11 items-center gap-3 border-b border-white text-sm font-semibold"
              to="/showroom"
            >
              Enter the showroom <ArrowUpRight size={18} />
            </Link>
          </div>
        </div>
      </section>
      <SkillsSection />
      <AboutSection />
      <ContactSection />
    </>
  );
}
