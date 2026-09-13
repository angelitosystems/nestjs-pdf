import { useI18n } from '../../hooks/useI18n';
import { ArrowDown, CheckCircle, Shield, FileCode, Cpu, Layers } from 'lucide-react';

export function RenderingSection() {
  const { locale } = useI18n();

  const steps = [
    {
      num: '01',
      icon: FileCode,
      titleEn: 'Template Compilation & Interpolation',
      titleEs: 'Compilación e Interpolación de Plantilla',
      descEn:
        'TemplateService reads either inline HTML or disk file (.hbs), validates against allowed directories, and executes Handlebars with the provided data payload and helper functions.',
      descEs:
        'TemplateService lee HTML en línea o archivos .hbs en disco, valida contra directorios permitidos y ejecuta Handlebars con los datos y helpers provistos.',
    },
    {
      num: '02',
      icon: Layers,
      titleEn: 'Asset Resolution & Inlining',
      titleEs: 'Resolución e Incrustación de Recursos',
      descEn:
        'AssetService detects local images, external URLs, and @font-face custom fonts. Local files are converted directly to Data URIs (base64) within strict memory boundaries.',
      descEs:
        'AssetService detecta imágenes locales, URLs y fuentes @font-face. Los archivos locales se convierten a Data URIs (base64) dentro de límites de memoria estrictos.',
    },
    {
      num: '03',
      icon: Shield,
      titleEn: 'Security & SSRF Verification',
      titleEs: 'Verificación de Seguridad y SSRF',
      descEn:
        'If external resources are requested, PdfSecurityService pre-resolves DNS to block private subnets (RFC1918), AWS/GCP metadata endpoints (169.254.169.254), and path traversal escapes.',
      descEs:
        'Si se solicitan recursos externos, PdfSecurityService pre-resuelve DNS para bloquear subredes privadas (RFC1918), metadata cloud y escapes de directorio.',
    },
    {
      num: '04',
      icon: Cpu,
      titleEn: 'Browser Pool Context & Printing',
      titleEs: 'Contexto de Navegador e Impresión',
      descEn:
        'BrowserPoolService leases a pooled Chromium browser, allocates an isolated BrowserContext and Page, sets HTML content, and captures native print output via page.pdf().',
      descEs:
        'BrowserPoolService obtiene un navegador Chromium del pool, asigna un BrowserContext y Page aislados, carga el HTML e imprime el PDF con page.pdf().',
    },
    {
      num: '05',
      icon: CheckCircle,
      titleEn: 'Guaranteed Cleanup in Finally Block',
      titleEs: 'Limpieza Garantizada en Bloque Finally',
      descEn:
        'Both the Page and BrowserContext are immediately closed in a finally block regardless of success or failure. The browser operation counter increments for scheduled recycling.',
      descEs:
        'Tanto Page como BrowserContext se destruyen inmediatamente en un bloque finally (con éxito o error). El contador del navegador se incrementa para reciclaje programado.',
    },
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      <div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          {locale === 'es' ? 'Pipeline de Renderizado' : 'Rendering Pipeline'}
        </h1>
        <p className="mt-3 text-base text-slate-600 dark:text-slate-400 leading-relaxed">
          {locale === 'es'
            ? 'Conoce la arquitectura interna de orquestación implementada en PdfRendererService para garantizar rendimiento, fidelidad visual y seguridad.'
            : 'Understand the internal orchestration pipeline implemented in PdfRendererService ensuring performance, visual accuracy, and security.'}
        </p>
      </div>

      {/* Visual Pipeline flow */}
      <div className="space-y-4">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          return (
            <div key={step.num} className="space-y-3">
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-start gap-4 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 flex items-center justify-center shrink-0 font-mono font-bold text-xs">
                  {step.num}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-slate-400" />
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      {locale === 'es' ? step.titleEs : step.titleEn}
                    </h3>
                  </div>
                  <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {locale === 'es' ? step.descEs : step.descEn}
                  </p>
                </div>
              </div>
              {idx < steps.length - 1 && (
                <div className="flex justify-center">
                  <ArrowDown className="w-4 h-4 text-slate-300 dark:text-slate-700" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
