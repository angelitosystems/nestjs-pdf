import { FileText, Heart, ExternalLink } from 'lucide-react';
import { useI18n } from '../hooks/useI18n';

interface FooterProps {
  onNavigate: (sectionId: string, itemId: string) => void;
}

export function Footer({ onNavigate }: FooterProps) {
  const { locale, t } = useI18n();

  return (
    <footer className="border-t border-slate-200 dark:border-slate-800/80 bg-slate-100/50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 py-12 text-xs transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand info */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-rose-600 to-red-500 flex items-center justify-center text-white shadow-md">
                <FileText className="w-4 h-4" />
              </div>
              <span className="font-bold text-sm text-slate-900 dark:text-white">
                @angelitosystems/<span className="text-rose-600 dark:text-rose-500">nestjs-pdf</span>
              </span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-[11px]">
              {locale === 'es'
                ? 'Librería empresarial de generación de PDFs para NestJS impulsada por Playwright y arquitectura desacoplada.'
                : 'Enterprise-grade PDF generation library for NestJS powered by Playwright and decoupled architecture.'}
            </p>
            <div className="flex items-center gap-2 pt-2">
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-mono font-medium">
                0 Vulnerabilities
              </span>
              <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 text-[10px] font-mono font-medium">
                MIT License
              </span>
            </div>
          </div>

          {/* Column 1: Docs */}
          <div className="space-y-2.5">
            <h4 className="font-semibold text-slate-900 dark:text-slate-200 uppercase tracking-wider text-[11px]">
              {t.common.documentation}
            </h4>
            <ul className="space-y-2 text-slate-500 dark:text-slate-400">
              <li>
                <button
                  onClick={() => onNavigate('getting-started', 'introduction')}
                  className="hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer"
                >
                  {locale === 'es' ? 'Introducción' : 'Introduction'}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('getting-started', 'installation')}
                  className="hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer"
                >
                  {locale === 'es' ? 'Instalación' : 'Installation'}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('getting-started', 'quick-start')}
                  className="hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer"
                >
                  {locale === 'es' ? 'Inicio Rápido' : 'Quick Start'}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('core-concepts', 'pdf-module')}
                  className="hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer"
                >
                  PdfModule & forRoot
                </button>
              </li>
            </ul>
          </div>

          {/* Column 2: Guides & Architecture */}
          <div className="space-y-2.5">
            <h4 className="font-semibold text-slate-900 dark:text-slate-200 uppercase tracking-wider text-[11px]">
              {t.common.guides}
            </h4>
            <ul className="space-y-2 text-slate-500 dark:text-slate-400">
              <li>
                <button
                  onClick={() => onNavigate('guides', 'handlebars-helpers')}
                  className="hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer"
                >
                  {locale === 'es' ? 'Helpers de Handlebars' : 'Handlebars Helpers'}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('guides', 'custom-storage')}
                  className="hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer"
                >
                  {locale === 'es' ? 'Adaptador S3 / MinIO' : 'Custom S3 Storage'}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('advanced', 'security-adv')}
                  className="hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer"
                >
                  {locale === 'es' ? 'Seguridad y SSRF' : 'Security & SSRF'}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('deployment', 'docker-deployment')}
                  className="hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer"
                >
                  {locale === 'es' ? 'Despliegue con Docker' : 'Docker Deployment'}
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: External Ecosystem */}
          <div className="space-y-2.5">
            <h4 className="font-semibold text-slate-900 dark:text-slate-200 uppercase tracking-wider text-[11px]">
              Ecosystem
            </h4>
            <ul className="space-y-2 text-slate-500 dark:text-slate-400">
              <li>
                <a
                  href="https://www.npmjs.com/package/@angelitosystems/nestjs-pdf"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-rose-600 dark:hover:text-rose-400 transition-colors flex items-center gap-1"
                >
                  <span>NPM Registry</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/AngelitoSystems/nestjs-pdf"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-rose-600 dark:hover:text-rose-400 transition-colors flex items-center gap-1"
                >
                  <span>GitHub Repository</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://nestjs.com"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-rose-600 dark:hover:text-rose-400 transition-colors flex items-center gap-1"
                >
                  <span>NestJS Framework</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://playwright.dev"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-rose-600 dark:hover:text-rose-400 transition-colors flex items-center gap-1"
                >
                  <span>Playwright Core</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 border-t border-slate-200 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px]">
          <p>© 2026 AngelitoSystems. All rights reserved.</p>
          <div className="flex items-center gap-1">
            <span>Built with</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            <span>for the NestJS community</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

