import { useEffect, useState } from 'react';
import { I18nProvider } from './hooks/useI18n';
import { RootLayout } from './layouts/RootLayout';
import { LandingPage } from './pages/LandingPage';
import { DocsPage } from './pages/DocsPage';

export default function App() {
  const [view, setView] = useState<'landing' | 'docs'>('landing');
  const [activeSectionId, setActiveSectionId] = useState('getting-started');
  const [activeItemId, setActiveItemId] = useState('introduction');

  // Parse URL hash on mount & on hashchange
  useEffect(() => {
    const parseHash = () => {
      const hash = window.location.hash.replace(/^#\/?/, '');
      if (!hash || hash === '') {
        setView('landing');
        return;
      }

      const parts = hash.split('/');
      if (parts[0] === 'docs') {
        setView('docs');
        if (parts[1]) setActiveSectionId(parts[1]);
        if (parts[2]) setActiveItemId(parts[2]);
      } else {
        setView('landing');
      }
    };

    parseHash();
    window.addEventListener('hashchange', parseHash);
    return () => window.removeEventListener('hashchange', parseHash);
  }, []);

  const handleNavigate = (sectionId: string, itemId: string) => {
    setActiveSectionId(sectionId);
    setActiveItemId(itemId);
    setView('docs');
    window.location.hash = `/docs/${sectionId}/${itemId}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGoHome = () => {
    setView('landing');
    window.location.hash = '/';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <I18nProvider>
      <RootLayout
        onNavigate={handleNavigate}
        onGoHome={handleGoHome}
      >
        {view === 'landing' ? (
          <LandingPage
            onGetStarted={() => handleNavigate('getting-started', 'quick-start')}
            onNavigate={handleNavigate}
          />
        ) : (
          <DocsPage
            sectionId={activeSectionId}
            itemId={activeItemId}
            onSelect={handleNavigate}
            onGoHome={handleGoHome}
          />
        )}
      </RootLayout>
    </I18nProvider>
  );
}
