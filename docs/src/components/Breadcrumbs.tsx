import { ChevronRight, Home } from 'lucide-react';
import { useI18n } from '../hooks/useI18n';

interface BreadcrumbsProps {
  category: string;
  item: string;
  onGoHome: () => void;
}

export function Breadcrumbs({ category, item, onGoHome }: BreadcrumbsProps) {
  const { locale } = useI18n();

  return (
    <nav className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400 mb-6 flex-wrap">
      <button
        onClick={onGoHome}
        className="flex items-center gap-1 hover:text-rose-500 transition-colors cursor-pointer"
      >
        <Home className="w-3.5 h-3.5" />
        <span>{locale === 'es' ? 'Inicio' : 'Home'}</span>
      </button>
      <ChevronRight className="w-3 h-3 text-slate-400 dark:text-slate-600 shrink-0" />
      <span className="text-slate-600 dark:text-slate-300 font-mono">{category}</span>
      <ChevronRight className="w-3 h-3 text-slate-400 dark:text-slate-600 shrink-0" />
      <span className="text-rose-600 dark:text-rose-400 font-semibold">{item}</span>
    </nav>
  );
}
