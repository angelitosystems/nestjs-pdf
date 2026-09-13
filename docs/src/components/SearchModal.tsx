import React, { useEffect, useRef, useState } from 'react';
import { Command, Search, X, ChevronRight, Hash } from 'lucide-react';
import { searchIndex, SearchResult } from '../data/searchIndex';
import { useI18n } from '../hooks/useI18n';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (sectionId: string, itemId: string) => void;
}

export function SearchModal({ isOpen, onClose, onSelect }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const { locale, t } = useI18n();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  const filteredResults: SearchResult[] = query.trim()
    ? searchIndex.filter((item) => {
        const q = query.toLowerCase();
        const title = (locale === 'es' ? item.titleEs : item.titleEn).toLowerCase();
        const snippet = (locale === 'es' ? item.snippetEs : item.snippetEn).toLowerCase();
        const category = (locale === 'es' ? item.categoryEs : item.categoryEn).toLowerCase();
        const matchesKeywords = item.keywords.some((kw) => kw.toLowerCase().includes(q));
        return title.includes(q) || snippet.includes(q) || category.includes(q) || matchesKeywords;
      })
    : searchIndex.slice(0, 8);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredResults.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredResults.length) % Math.max(1, filteredResults.length));
    } else if (e.key === 'Enter' && filteredResults[selectedIndex]) {
      e.preventDefault();
      const item = filteredResults[selectedIndex];
      onSelect(item.sectionId, item.id);
      onClose();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Input bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-800 gap-3">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.common.searchPlaceholder}
            className="w-full bg-transparent border-none text-slate-100 placeholder-slate-500 focus:outline-none text-sm font-sans"
          />
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 divide-y divide-slate-800/40">
          {filteredResults.length === 0 ? (
            <div className="py-8 text-center text-sm text-slate-500">
              {locale === 'es' ? 'No se encontraron resultados' : 'No results found'}
            </div>
          ) : (
            filteredResults.map((result, idx) => {
              const isSelected = idx === selectedIndex;
              const title = locale === 'es' ? result.titleEs : result.titleEn;
              const category = locale === 'es' ? result.categoryEs : result.categoryEn;
              const snippet = locale === 'es' ? result.snippetEs : result.snippetEn;

              return (
                <div
                  key={result.id}
                  onClick={() => {
                    onSelect(result.sectionId, result.id);
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`p-3 rounded-xl flex items-start gap-3 cursor-pointer transition-all ${
                    isSelected ? 'bg-rose-500/15 border border-rose-500/30' : 'hover:bg-slate-800/50'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                      isSelected
                        ? 'bg-rose-500 text-white'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    <Hash className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-rose-400 font-mono">
                        {category}
                      </span>
                      <ChevronRight className="w-3 h-3 text-slate-600" />
                      <span className="text-sm font-semibold text-white truncate">
                        {title}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                      {snippet}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2.5 bg-slate-950/80 border-t border-slate-800/80 text-[11px] text-slate-500 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-[10px] text-slate-300">↑↓</kbd>
              <span>{locale === 'es' ? 'Navegar' : 'Navigate'}</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-[10px] text-slate-300">↵</kbd>
              <span>{locale === 'es' ? 'Seleccionar' : 'Select'}</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-[10px] text-slate-300">Esc</kbd>
              <span>{locale === 'es' ? 'Cerrar' : 'Close'}</span>
            </span>
          </div>
          <div className="flex items-center gap-1 text-slate-400">
            <Command className="w-3 h-3" />
            <span>Search</span>
          </div>
        </div>
      </div>
    </div>
  );
}
