import React, { useEffect, useState } from 'react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { SearchModal } from '../components/SearchModal';

interface RootLayoutProps {
  children: React.ReactNode;
  onNavigate: (sectionId: string, itemId: string) => void;
  onGoHome: () => void;
}

export function RootLayout({ children, onNavigate, onGoHome }: RootLayoutProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Global Ctrl+K shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col selection:bg-rose-500 selection:text-white transition-colors duration-200">
      <Header
        onOpenSearch={() => setIsSearchOpen(true)}
        onNavigate={onNavigate}
        onGoHome={onGoHome}
      />

      <div className="flex-1 w-full">
        {children}
      </div>

      <Footer onNavigate={onNavigate} />

      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelect={onNavigate}
      />
    </div>
  );
}

