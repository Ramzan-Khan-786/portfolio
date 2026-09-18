import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import { PortfolioProvider } from './context/PortfolioContext.jsx';
import { ErrorBoundary, StatePanel } from './components/Ui.jsx';
import PublicLayout from './pages/PublicLayout.jsx';
import PortfolioHome from './pages/PortfolioHome.jsx';
import SkillsSection from './components/SkillsSection.jsx';
import WorkSection from './components/WorkSection.jsx';
import { AboutSection, ContactSection } from './components/AboutContact.jsx';
import Metadata from './components/Metadata.jsx';
import DetailPage, { NotFound } from './pages/DetailPage.jsx';
const Showroom = lazy(() => import('./components/Showroom.jsx'));
const AdminApp = lazy(() => import('./pages/AdminApp.jsx'));
const section = (title, element) => (
  <>
    <Metadata title={title} />
    {element}
  </>
);
export default function App() {
  return (
    <ErrorBoundary>
      <PortfolioProvider>
        <Suspense fallback={<StatePanel loading title="Opening workspace" />}>
          <Routes>
            <Route path="/admin/*" element={<AdminApp />} />
            <Route element={<PublicLayout />}>
              <Route index element={<PortfolioHome />} />
              <Route path="/profile" element={<PortfolioHome />} />
              <Route path="/skills" element={section('Skills', <SkillsSection page />)} />
              <Route path="/work" element={section('Work', <WorkSection page />)} />
              <Route path="/work/:slug" element={<DetailPage />} />
              <Route path="/showroom" element={section('Showroom', <Showroom />)} />
              <Route path="/about" element={section('About', <AboutSection page />)} />
              <Route path="/contact" element={section('Contact', <ContactSection page />)} />
              <Route path="/:slug" element={<DetailPage type="page" />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </Suspense>
      </PortfolioProvider>
    </ErrorBoundary>
  );
}
