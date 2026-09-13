import { useState } from 'react';
import {
  FileText,
  Search,
  Globe,
  Sun,
  Moon,
  Monitor,
  Menu,
  X,
  ExternalLink,
} from 'lucide-react';
import { useI18n } from '../hooks/useI18n';
import { Theme, useTheme } from '../hooks/useTheme';

interface HeaderProps {
  onOpenSearch: () => void;
  onNavigate: (sectionId: string, itemId: string) => void;
  onGoHome: () => void;
}

export function Header({ onOpenSearch, onNavigate, onGoHome }: HeaderProps) {
  const { locale, setLocale, t } = useI18n();
  const { theme, setTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [themeDropdownOpen, setThemeDropdownOpen] = useState(false);

  const handleNavClick = (sectionId: string, itemId: string) => {
    onNavigate(sectionId, itemId);
    setMobileMenuOpen(false);
  };

  const cycleTheme = (nextTheme: Theme) => {
    setTheme(nextTheme);
    setThemeDropdownOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800/80 bg-white/85 dark:bg-slate-950/85 backdrop-blur-xl transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Logo & Brand */}
        <div className="flex items-center gap-3">
          <button
            onClick={onGoHome}
            className="flex items-center gap-3 group text-left cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-600 to-red-500 flex items-center justify-center shadow-md shadow-rose-600/30 group-hover:scale-105 transition-transform">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-sm sm:text-base tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
                @angelitosystems/<span className="text-rose-600 dark:text-rose-500">nestjs-pdf</span>
                <span className="text-[10px] font-mono bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 px-1.5 py-0.5 rounded-full font-medium hidden sm:inline-block">
                  v0.1.0
                </span>
              </span>
            </div>
          </button>
        </div>

        {/* Center Search trigger */}
        <div className="flex-1 max-w-md mx-2 hidden md:block">
          <button
            onClick={onOpenSearch}
            className="w-full flex items-center justify-between px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700 transition-all cursor-pointer shadow-inner"
          >
            <div className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-slate-400" />
              <span>{t.common.searchPlaceholder}</span>
            </div>
            <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-[10px] font-mono text-slate-600 dark:text-slate-400">
              Ctrl K
            </kbd>
          </button>
        </div>

        {/* Desktop Nav Actions */}
        <div className="hidden lg:flex items-center gap-3">
          <button
            onClick={() => handleNavClick('getting-started', 'introduction')}
            className="text-xs font-semibold px-3 py-2 rounded-lg text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors cursor-pointer"
          >
            {t.common.documentation}
          </button>
          <button
            onClick={() => handleNavClick('guides', 'generate-pdf')}
            className="text-xs font-semibold px-3 py-2 rounded-lg text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors cursor-pointer"
          >
            {t.common.guides}
          </button>
          <button
            onClick={() => handleNavClick('api-reference', 'api-pdf-service')}
            className="text-xs font-semibold px-3 py-2 rounded-lg text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors cursor-pointer"
          >
            {t.common.apiReference}
          </button>

          <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 mx-1" />

          {/* Language Selector */}
          <div className="relative">
            <button
              onClick={() => setLangDropdownOpen(!langDropdownOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-all cursor-pointer"
              title="Change Language"
            >
              <Globe className="w-3.5 h-3.5 text-rose-500" />
              <span>{locale === 'en' ? 'EN' : 'ES'}</span>
            </button>

            {langDropdownOpen && (
              <div className="absolute right-0 mt-2 w-32 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-1 z-50 text-xs animate-fadeIn">
                <button
                  onClick={() => {
                    setLocale('en');
                    setLangDropdownOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer ${
                    locale === 'en' ? 'font-bold text-rose-600 dark:text-rose-400' : 'text-slate-600 dark:text-slate-300'
                  }`}
                >
                  <span>English</span>
                  <span>🇺🇸</span>
                </button>
                <button
                  onClick={() => {
                    setLocale('es');
                    setLangDropdownOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer ${
                    locale === 'es' ? 'font-bold text-rose-600 dark:text-rose-400' : 'text-slate-600 dark:text-slate-300'
                  }`}
                >
                  <span>Español</span>
                  <span>🇪🇸</span>
                </button>
              </div>
            )}
          </div>

          {/* Theme Selector */}
          <div className="relative">
            <button
              onClick={() => setThemeDropdownOpen(!themeDropdownOpen)}
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300 transition-all cursor-pointer"
              title="Toggle Theme"
            >
              {theme === 'dark' && <Moon className="w-4 h-4 text-rose-400" />}
              {theme === 'light' && <Sun className="w-4 h-4 text-amber-500" />}
              {theme === 'system' && <Monitor className="w-4 h-4 text-cyan-400" />}
            </button>

            {themeDropdownOpen && (
              <div className="absolute right-0 mt-2 w-32 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-1 z-50 text-xs animate-fadeIn">
                <button
                  onClick={() => cycleTheme('light')}
                  className={`w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer ${
                    theme === 'light' ? 'font-bold text-rose-600 dark:text-rose-400' : 'text-slate-600 dark:text-slate-300'
                  }`}
                >
                  <Sun className="w-3.5 h-3.5 text-amber-500" />
                  <span>{t.common.light}</span>
                </button>
                <button
                  onClick={() => cycleTheme('dark')}
                  className={`w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer ${
                    theme === 'dark' ? 'font-bold text-rose-600 dark:text-rose-400' : 'text-slate-600 dark:text-slate-300'
                  }`}
                >
                  <Moon className="w-3.5 h-3.5 text-rose-400" />
                  <span>{t.common.dark}</span>
                </button>
                <button
                  onClick={() => cycleTheme('system')}
                  className={`w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer ${
                    theme === 'system' ? 'font-bold text-rose-600 dark:text-rose-400' : 'text-slate-600 dark:text-slate-300'
                  }`}
                >
                  <Monitor className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{t.common.system}</span>
                </button>
              </div>
            )}
          </div>

          <a
            href="https://github.com/AngelitoSystems/nestjs-pdf"
            target="_blank"
            rel="noreferrer"
            className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 transition-all flex items-center gap-1.5"
          >
            GitHub
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </a>

          {/* Primary CTA */}
          <button
            onClick={() => handleNavClick('getting-started', 'quick-start')}
            className="text-xs font-semibold px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white shadow-md shadow-rose-600/20 transition-all cursor-pointer"
          >
            {t.common.getStarted}
          </button>
        </div>

        {/* Mobile menu trigger */}
        <div className="flex items-center gap-2 lg:hidden">
          <button
            onClick={onOpenSearch}
            className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300"
          >
            <Search className="w-4 h-4" />
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 pt-3 pb-6 space-y-4 animate-fadeIn">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                setLocale(locale === 'en' ? 'es' : 'en');
                setMobileMenuOpen(false);
              }}
              className="flex items-center justify-center gap-2 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold"
            >
              <Globe className="w-4 h-4 text-rose-500" />
              <span>{locale === 'en' ? 'Español 🇪🇸' : 'English 🇺🇸'}</span>
            </button>
            <button
              onClick={() => {
                setTheme(theme === 'dark' ? 'light' : 'dark');
                setMobileMenuOpen(false);
              }}
              className="flex items-center justify-center gap-2 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-rose-400" />}
              <span>{theme === 'dark' ? t.common.light : t.common.dark}</span>
            </button>
          </div>

          <div className="space-y-1 pt-2 border-t border-slate-100 dark:border-slate-900">
            <button
              onClick={() => handleNavClick('getting-started', 'introduction')}
              className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900"
            >
              {t.common.documentation}
            </button>
            <button
              onClick={() => handleNavClick('guides', 'generate-pdf')}
              className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900"
            >
              {t.common.guides}
            </button>
            <button
              onClick={() => handleNavClick('api-reference', 'api-pdf-service')}
              className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900"
            >
              {t.common.apiReference}
            </button>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-900 flex flex-col gap-2">
            <a
              href="https://github.com/AngelitoSystems/nestjs-pdf"
              target="_blank"
              rel="noreferrer"
              className="w-full text-center py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300"
            >
              GitHub Repository
            </a>
            <a
              href="https://www.npmjs.com/package/@angelitosystems/nestjs-pdf"
              target="_blank"
              rel="noreferrer"
              className="w-full text-center py-2.5 rounded-xl bg-rose-600 text-white text-xs font-semibold shadow-md shadow-rose-600/20"
            >
              {t.common.viewOnNpm}
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
