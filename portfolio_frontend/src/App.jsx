import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import { PortfolioProvider } from './context/PortfolioContext.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { ErrorBoundary, StatePanel } from './components/Ui.jsx';
import PublicLayout from './pages/PublicLayout.jsx';
import PortfolioHome from './pages/PortfolioHome.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import SkillsSection from './components/SkillsSection.jsx';
import WorkSection from './components/WorkSection.jsx';
import { AboutSection, ContactSection } from './components/AboutContact.jsx';
import Metadata from './components/Metadata.jsx';
import DetailPage, { NotFound } from './pages/DetailPage.jsx';
const Showroom = lazy(() => import('./components/Showroom.jsx'));
const AdminApp = lazy(() => import('./pages/AdminApp.jsx'));
const ResumePage = lazy(() => import('./pages/ResumePage.jsx'));
const AuthPage = lazy(() => import('./pages/AuthPage.jsx'));
const AccountPage = lazy(() => import('./pages/AccountPage.jsx'));
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
        <ThemeProvider>
          <AuthProvider>
            <Suspense fallback={<StatePanel loading title="Opening workspace" />}>
              <Routes>
                <Route path="/admin/*" element={<AdminApp />} />
                <Route element={<PublicLayout />}>
                  <Route index element={<PortfolioHome />} />
                  <Route path="/home" element={<PortfolioHome />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/skills" element={section('Skills', <SkillsSection />)} />
                  <Route path="/work" element={section('Work', <WorkSection />)} />
                  <Route path="/work/:slug" element={<DetailPage />} />
                  <Route path="/showroom" element={section('Showroom', <Showroom />)} />
                  <Route path="/resume" element={<ResumePage />} />
                  <Route path="/about" element={section('About', <AboutSection />)} />
                  <Route path="/contact" element={section('Contact', <ContactSection />)} />
                  <Route path="/login" element={<AuthPage key="login" mode="login" />} />
                  <Route path="/signup" element={<AuthPage key="signup" mode="signup" />} />
                  <Route path="/account" element={<AccountPage />} />
                  <Route path="/:slug" element={<DetailPage type="page" />} />
                  <Route path="*" element={<NotFound />} />
                </Route>
              </Routes>
            </Suspense>
          </AuthProvider>
        </ThemeProvider>
      </PortfolioProvider>
    </ErrorBoundary>
  );
}
