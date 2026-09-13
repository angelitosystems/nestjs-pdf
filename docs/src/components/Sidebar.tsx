import { useState } from 'react';
import {
  ChevronDown,
  ChevronRight,
  BookOpen,
  Layers,
  Zap,
  Code,
  Cpu,
  Server,
} from 'lucide-react';
import { navigationData, NavSection } from '../data/navigation';
import { useI18n } from '../hooks/useI18n';

interface SidebarProps {
  activeSectionId: string;
  activeItemId: string;
  onSelect: (sectionId: string, itemId: string) => void;
}

export function Sidebar({ activeSectionId, activeItemId, onSelect }: SidebarProps) {
  const { locale } = useI18n();
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});

  const toggleSection = (sectionId: string) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  const getSectionIcon = (iconName: string) => {
    switch (iconName) {
      case 'BookOpen':
        return <BookOpen className="w-4 h-4 text-rose-500" />;
      case 'Layers':
        return <Layers className="w-4 h-4 text-blue-500" />;
      case 'Zap':
        return <Zap className="w-4 h-4 text-amber-500" />;
      case 'Code':
        return <Code className="w-4 h-4 text-purple-500" />;
      case 'Cpu':
        return <Cpu className="w-4 h-4 text-cyan-500" />;
      case 'Server':
        return <Server className="w-4 h-4 text-emerald-500" />;
      default:
        return <BookOpen className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <aside className="w-full lg:w-64 shrink-0 pb-12 space-y-6 select-none">
      {navigationData.map((section: NavSection) => {
        const isCollapsed = collapsedSections[section.id] ?? false;
        const sectionTitle = locale === 'es' ? section.titleEs : section.titleEn;

        return (
          <div key={section.id} className="space-y-1">
            <button
              onClick={() => toggleSection(section.id)}
              className="w-full flex items-center justify-between px-2.5 py-1.5 text-xs font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wider rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-2">
                {getSectionIcon(section.icon)}
                <span>{sectionTitle}</span>
              </div>
              {isCollapsed ? (
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300" />
              )}
            </button>

            {!isCollapsed && (
              <div className="space-y-0.5 pt-1 pl-2 border-l border-slate-200 dark:border-slate-800 ml-4">
                {section.items.map((item) => {
                  const isActive = activeSectionId === section.id && activeItemId === item.id;
                  const itemTitle = locale === 'es' ? item.titleEs : item.titleEn;

                  return (
                    <button
                      key={item.id}
                      onClick={() => onSelect(section.id, item.id)}
                      className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-medium transition-all text-left cursor-pointer ${
                        isActive
                          ? 'bg-rose-50 dark:bg-rose-500/15 text-rose-600 dark:text-rose-400 font-semibold border-l-2 border-rose-500'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100/60 dark:hover:bg-slate-900/60'
                      }`}
                    >
                      <span className="truncate">{itemTitle}</span>
                      {item.badge && (
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </aside>
  );
}
