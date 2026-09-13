import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { useI18n } from '../hooks/useI18n';

interface CodeBlockProps {
  code: string;
  language?: string;
  filename?: string;
  showLineNumbers?: boolean;
}

export function CodeBlock({
  code,
  language = 'typescript',
  filename,
  showLineNumbers = false,
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const { t } = useI18n();

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lines = code.trimEnd().split('\n');

  return (
    <div className="relative group rounded-xl bg-slate-900 border border-slate-800 dark:border-slate-800/80 overflow-hidden shadow-xl my-4">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-950/80 border-b border-slate-800/80 text-xs">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 opacity-60">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
          </div>
          {filename && (
            <span className="font-mono text-slate-300 font-medium pl-2 border-l border-slate-800">
              {filename}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span className="font-mono text-rose-400 font-semibold text-[11px] uppercase">
            {language}
          </span>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 py-1 px-2 rounded-md hover:bg-slate-800 text-slate-400 hover:text-slate-100 transition-colors text-xs font-medium cursor-pointer"
            title={t.common.copy}
            aria-label={t.common.copy}
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-sans">{t.common.copied}</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span className="font-sans">{t.common.copy}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Code content */}
      <div className="p-4 overflow-x-auto text-xs sm:text-sm font-mono leading-relaxed text-slate-200">
        {showLineNumbers ? (
          <table className="w-full border-collapse">
            <tbody>
              {lines.map((line, idx) => (
                <tr key={idx} className="hover:bg-slate-800/40">
                  <td className="pr-4 text-right select-none text-slate-600 w-8 text-xs align-top">
                    {idx + 1}
                  </td>
                  <td className="whitespace-pre align-top">{line || ' '}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <pre>
            <code>{code}</code>
          </pre>
        )}
      </div>
    </div>
  );
}
