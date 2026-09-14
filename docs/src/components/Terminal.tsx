import { useState } from 'react';
import { Check, Copy, Terminal as TerminalIcon } from 'lucide-react';
import { useI18n } from '../hooks/useI18n';

type PackageManager = 'npm' | 'pnpm' | 'yarn' | 'bun';

export function Terminal() {
  const [pm, setPm] = useState<PackageManager>('npm');
  const [copied, setCopied] = useState(false);
  const { t } = useI18n();

  const commands: Record<PackageManager, { install: string; doctor: string }> = {
    npm: {
      install: 'npm install @angelitosystems/nestjs-pdf',
      doctor: 'npx angelito-pdf doctor',
    },
    pnpm: {
      install: 'pnpm add @angelitosystems/nestjs-pdf',
      doctor: 'pnpm dlx angelito-pdf doctor',
    },
    yarn: {
      install: 'yarn add @angelitosystems/nestjs-pdf',
      doctor: 'yarn dlx angelito-pdf doctor',
    },
    bun: {
      install: 'bun add @angelitosystems/nestjs-pdf',
      doctor: 'bunx angelito-pdf doctor',
    },
  };

  const currentCommand = commands[pm].install;

  const handleCopy = () => {
    navigator.clipboard.writeText(currentCommand);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-2xl bg-slate-950 border border-slate-800 shadow-2xl overflow-hidden my-6">
      {/* Terminal Title Bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-900/90 border-b border-slate-800">
        <div className="flex items-center gap-3">
          {/* macOS dots */}
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-500/90 inline-block" />
            <span className="w-3 h-3 rounded-full bg-amber-500/90 inline-block" />
            <span className="w-3 h-3 rounded-full bg-emerald-500/90 inline-block" />
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono pl-2">
            <TerminalIcon className="w-3.5 h-3.5 text-slate-500" />
            <span>bash — 80x24</span>
          </div>
        </div>

        {/* Package manager tabs */}
        <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-lg border border-slate-800/80">
          {(['npm', 'pnpm', 'yarn', 'bun'] as PackageManager[]).map((manager) => (
            <button
              key={manager}
              onClick={() => setPm(manager)}
              className={`px-2.5 py-1 text-xs font-mono font-medium rounded-md transition-all cursor-pointer ${
                pm === manager
                  ? 'bg-rose-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              {manager}
            </button>
          ))}
        </div>
      </div>

      {/* Terminal Body */}
      <div className="p-5 font-mono text-xs sm:text-sm text-slate-200 space-y-3">
        {/* Command 1 */}
        <div className="flex items-center justify-between group">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-emerald-400 font-bold">$</span>
            <span className="text-rose-300 font-semibold">{currentCommand}</span>
            <span className="inline-block w-2 h-4 bg-rose-500 animate-blink" />
          </div>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 py-1 px-2.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition-all text-xs font-sans cursor-pointer shrink-0 ml-2"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">{t.common.copied}</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>{t.common.copy}</span>
              </>
            )}
          </button>
        </div>

        {/* Simulated output */}
        <div className="text-slate-500 text-xs pl-4 border-l border-slate-800/80 space-y-1">
          <p className="text-slate-400">
            ✔ {t.landing.terminal.installedSuccess} 0.42s
          </p>
          <p className="text-emerald-400/90 font-medium">
            + @angelitosystems/nestjs-pdf@0.1.0
          </p>
          <p className="text-slate-500">
            {t.landing.terminal.readyToGenerate}
          </p>
        </div>

        {/* Command 2: Doctor */}
        <div className="pt-2 border-t border-slate-900 flex items-center gap-2 text-slate-400 text-xs">
          <span className="text-emerald-400 font-bold">$</span>
          <span className="text-slate-300">{commands[pm].doctor}</span>
          <span className="text-slate-500 ml-auto hidden sm:inline-block">// checks installed browser</span>
        </div>
      </div>
    </div>
  );
}

