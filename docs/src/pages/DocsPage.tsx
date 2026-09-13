import React from 'react';
import { Sidebar } from '../components/Sidebar';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { navigationData } from '../data/navigation';
import { useI18n } from '../hooks/useI18n';
import { ArrowLeft, ArrowRight } from 'lucide-react';

// Section components
import { IntroductionSection } from '../sections/getting-started/IntroductionSection';
import { InstallationSection } from '../sections/getting-started/InstallationSection';
import { QuickStartSection } from '../sections/getting-started/QuickStartSection';
import { ConfigurationSection } from '../sections/getting-started/ConfigurationSection';
import { PdfModuleSection } from '../sections/core-concepts/PdfModuleSection';
import { PdfServiceSection } from '../sections/core-concepts/PdfServiceSection';
import { RenderingSection } from '../sections/core-concepts/RenderingSection';
import { SecuritySection } from '../sections/core-concepts/SecuritySection';
import { BrowserManagementSection } from '../sections/core-concepts/BrowserManagementSection';
import { QueueSection } from '../sections/core-concepts/QueueSection';
import { StorageSection } from '../sections/core-concepts/StorageSection';
import { HandlebarsHelpersGuide } from '../sections/guides/HandlebarsHelpersGuide';
import { CustomStorageGuide } from '../sections/guides/CustomStorageGuide';
import { ApiReferenceSection } from '../sections/api/ApiReferenceSection';
import { DockerDeploymentGuide } from '../sections/deployment/DockerDeploymentGuide';

interface DocsPageProps {
  sectionId: string;
  itemId: string;
  onSelect: (sectionId: string, itemId: string) => void;
  onGoHome: () => void;
}

export function DocsPage({ sectionId, itemId, onSelect, onGoHome }: DocsPageProps) {
  const { locale, t } = useI18n();

  // Find category and item titles for Breadcrumbs
  const currentCategory = navigationData.find((s) => s.id === sectionId) || navigationData[0];
  const currentItem = currentCategory.items.find((i) => i.id === itemId) || currentCategory.items[0];

  const categoryTitle = locale === 'es' ? currentCategory.titleEs : currentCategory.titleEn;
  const itemTitle = locale === 'es' ? currentItem.titleEs : currentItem.titleEn;

  // Find previous and next items for linear navigation
  const allItems: Array<{ sectionId: string; itemId: string; title: string }> = [];
  navigationData.forEach((s) => {
    s.items.forEach((i) => {
      allItems.push({
        sectionId: s.id,
        itemId: i.id,
        title: locale === 'es' ? i.titleEs : i.titleEn,
      });
    });
  });

  const currentIndex = allItems.findIndex((x) => x.sectionId === sectionId && x.itemId === itemId);
  const prevItem = currentIndex > 0 ? allItems[currentIndex - 1] : null;
  const nextItem = currentIndex < allItems.length - 1 ? allItems[currentIndex + 1] : null;

  // Render the appropriate section content
  const renderContent = () => {
    switch (itemId) {
      case 'introduction':
        return <IntroductionSection />;
      case 'installation':
        return <InstallationSection />;
      case 'quick-start':
        return <QuickStartSection />;
      case 'configuration':
        return <ConfigurationSection />;
      case 'pdf-module':
      case 'api-pdf-module':
        return <PdfModuleSection />;
      case 'pdf-service':
      case 'api-pdf-service':
      case 'api-pdf-result':
        return <PdfServiceSection />;
      case 'rendering':
      case 'generate-pdf':
      case 'html-templates':
        return <RenderingSection />;
      case 'templates':
      case 'handlebars-helpers':
        return <HandlebarsHelpersGuide />;
      case 'assets':
      case 'images-fonts':
        return <RenderingSection />;
      case 'browser-management':
      case 'browser-pool-adv':
        return <BrowserManagementSection />;
      case 'security':
      case 'security-adv':
        return <SecuritySection />;
      case 'storage':
      case 'custom-storage':
        return <CustomStorageGuide />;
      case 'queue':
      case 'concurrency-adv':
        return <QueueSection />;
      case 'api-types':
      case 'api-interfaces':
      case 'api-tokens':
      case 'custom-engines':
      case 'extending-library':
        return <ApiReferenceSection />;
      case 'docker-deployment':
      case 'linux-setup':
      case 'cicd-github-actions':
      case 'production-deployment':
      case 'production-setup':
        return <DockerDeploymentGuide />;
      default:
        return <IntroductionSection />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col lg:flex-row gap-10">
      {/* Sidebar navigation */}
      <Sidebar
        activeSectionId={sectionId}
        activeItemId={itemId}
        onSelect={onSelect}
      />

      {/* Main documentation content */}
      <main className="flex-1 min-w-0">
        <Breadcrumbs
          category={categoryTitle}
          item={itemTitle}
          onGoHome={onGoHome}
        />

        {/* Section Body */}
        <article className="prose dark:prose-invert max-w-none">
          {renderContent()}
        </article>

        {/* Previous & Next Navigation */}
        <div className="mt-16 pt-8 border-t border-slate-200 dark:border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {prevItem ? (
            <button
              onClick={() => onSelect(prevItem.sectionId, prevItem.itemId)}
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-all text-left group cursor-pointer"
            >
              <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
                <span>{t.common.previous}</span>
              </div>
              <div className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                {prevItem.title}
              </div>
            </button>
          ) : (
            <div />
          )}

          {nextItem && (
            <button
              onClick={() => onSelect(nextItem.sectionId, nextItem.itemId)}
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-all text-right group cursor-pointer"
            >
              <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center justify-end gap-1">
                <span>{t.common.next}</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
              <div className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                {nextItem.title}
              </div>
            </button>
          )}
        </div>
      </main>
    </div>
  );
}
