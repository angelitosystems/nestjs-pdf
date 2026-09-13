import { CodeBlock } from '../../components/CodeBlock';
import { useI18n } from '../../hooks/useI18n';
import { Cpu, RefreshCw, Layers } from 'lucide-react';

export function BrowserManagementSection() {
  const { locale } = useI18n();

  return (
    <div className="space-y-8 animate-fadeIn">
      <div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          {locale === 'es' ? 'Gestión del Pool de Navegadores' : 'Browser Pool Management'}
        </h1>
        <p className="mt-3 text-base text-slate-600 dark:text-slate-400 leading-relaxed">
          {locale === 'es'
            ? 'BrowserPoolService administra el ciclo de vida de los procesos Chromium, garantizando aislamiento total entre peticiones y reciclaje preventivo contra fugas de memoria.'
            : 'BrowserPoolService manages the lifecycle of Chromium processes, ensuring zero cross-request contamination and scheduled recycling against memory leaks.'}
        </p>
      </div>

      {/* Lifecycle Diagram */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300 space-y-4">
        <div className="text-cyan-400 font-bold">// Isolated Generation Lifecycle</div>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-center w-full">
            <span className="text-cyan-400 font-bold">Pooled Browser</span>
            <div className="text-[10px] text-slate-500">Reused across jobs</div>
          </div>
          <span className="text-slate-600 font-sans">➔</span>
          <div className="p-3 bg-slate-950 rounded-lg border border-rose-500/40 text-center w-full">
            <span className="text-rose-400 font-bold">Fresh Context</span>
            <div className="text-[10px] text-slate-400">Isolated cookies & cache</div>
          </div>
          <span className="text-slate-600 font-sans">➔</span>
          <div className="p-3 bg-slate-950 rounded-lg border border-blue-500/40 text-center w-full">
            <span className="text-blue-400 font-bold">Fresh Page</span>
            <div className="text-[10px] text-slate-400">Render HTML & PDF</div>
          </div>
          <span className="text-slate-600 font-sans">➔</span>
          <div className="p-3 bg-slate-950 rounded-lg border border-emerald-500/40 text-center w-full">
            <span className="text-emerald-400 font-bold">Finally Block</span>
            <div className="text-[10px] text-emerald-400">Close Page & Context</div>
          </div>
        </div>
      </div>

      {/* Why Reusing Browser but not Context */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          {locale === 'es'
            ? '¿Por qué reutilizar el Navegador pero NO el Context?'
            : 'Why Reuse the Browser but NOT the Context?'}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-5 rounded-xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 space-y-2">
            <h4 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
              <Cpu className="w-4 h-4 text-cyan-500" />
              {locale === 'es' ? 'Rendimiento: Reutilizar Browser' : 'Performance: Reusing Browser'}
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {locale === 'es'
                ? 'Iniciar un nuevo proceso Chromium toma entre 300ms y 1200ms de CPU. Al mantener instancias de Chromium en caliente en el pool, el tiempo de inicio se elimina por completo.'
                : 'Spawning a new Chromium OS process takes 300ms to 1200ms of CPU time. Maintaining warm standby browser instances removes this overhead entirely.'}
            </p>
          </div>

          <div className="p-5 rounded-xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 space-y-2">
            <h4 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
              <Layers className="w-4 h-4 text-rose-500" />
              {locale === 'es' ? 'Seguridad: BrowserContext Aislado' : 'Security: Isolated BrowserContext'}
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {locale === 'es'
                ? 'Cada solicitud recibe su propio BrowserContext. Los datos en memoria, cookies y almacenamiento local jamás se comparten ni pueden filtrarse entre usuarios diferentes.'
                : 'Each request receives an ephemeral BrowserContext. In-memory data, cookies, and local storage are never shared or leaked between different tenants.'}
            </p>
          </div>
        </div>
      </div>

      {/* Recycling mechanism */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <RefreshCw className="w-5 h-5 text-amber-500" />
          {locale === 'es' ? 'Reciclaje Preventivo contra Fugas de Memoria' : 'Preventative Recycling Against Memory Leaks'}
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          {locale === 'es'
            ? 'Chromium acumula fragmentación en memoria con el paso de miles de renders. Para mantener la estabilidad en producción a largo plazo, BrowserPoolService rastrea cuántas operaciones ha ejecutado cada instancia y la sustituye automáticamente de forma transparente.'
            : 'Chromium builds memory fragmentation over thousands of renders. To guarantee long-term production stability, BrowserPoolService tracks the operations count per instance and transparently recycles it once maxOperationsPerBrowser is reached.'}
        </p>

        <CodeBlock
          filename="src/app.module.ts"
          code={`PdfModule.forRoot({
  browser: {
    min: 1,                          // Standby warm browsers ready to accept requests
    max: 4,                          // Peak capacity ceiling under heavy load
    maxOperationsPerBrowser: 50,     // Automatically recycles browser after 50 operations
  },
})`}
        />
      </div>
    </div>
  );
}
