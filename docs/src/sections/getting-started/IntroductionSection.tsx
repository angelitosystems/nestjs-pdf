import { CodeBlock } from '../../components/CodeBlock';
import { useI18n } from '../../hooks/useI18n';
import { ShieldCheck, Cpu, Layers, Zap } from 'lucide-react';

export function IntroductionSection() {
  const { locale } = useI18n();

  return (
    <div className="space-y-8 animate-fadeIn">
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 text-xs font-semibold mb-3">
          <Zap className="w-3.5 h-3.5" />
          <span>v0.1.0 • Built for NestJS</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          {locale === 'es' ? 'Introducción' : 'Introduction'}
        </h1>
        <p className="mt-3 text-base text-slate-600 dark:text-slate-400 leading-relaxed">
          {locale === 'es'
            ? '@angelitosystems/nestjs-pdf es una solución profesional y lista para producción diseñada específicamente para generar documentos PDF dinámicos de alta fidelidad dentro del ecosistema NestJS.'
            : '@angelitosystems/nestjs-pdf is an enterprise-grade, production-ready solution engineered specifically to generate high-fidelity dynamic PDF documents within the NestJS ecosystem.'}
        </p>
      </div>

      {/* Comparison grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 rounded-2xl bg-rose-50/50 dark:bg-slate-900/40 border border-rose-200 dark:border-slate-800 space-y-3">
          <h3 className="font-bold text-sm text-rose-700 dark:text-rose-400 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            {locale === 'es' ? 'El problema con envoltorios genéricos' : 'The problem with generic wrappers'}
          </h3>
          <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-2 list-disc list-inside leading-relaxed">
            <li>
              {locale === 'es'
                ? 'Monolitos gigantes con @Injectable() agregado sin verdadera modularidad.'
                : 'Monolithic services with @Injectable() bolted on without true modularity.'}
            </li>
            <li>
              {locale === 'es'
                ? 'Lanzan un navegador Chromium completo por cada petición o comparten páginas entre usuarios.'
                : 'Launch a full Chromium process per request or share pages across concurrent users.'}
            </li>
            <li>
              {locale === 'es'
                ? 'Vulnerables a ataques SSRF y path traversal al renderizar HTML externo.'
                : 'Prone to SSRF and path traversal vulnerabilities when processing user templates.'}
            </li>
            <li>
              {locale === 'es'
                ? 'Descargan 500MB de binarios automáticamente bloqueando pipelines de CI/CD.'
                : 'Bundle 500MB browser binaries automatically, breaking CI/CD deployment pipelines.'}
            </li>
          </ul>
        </div>

        <div className="p-5 rounded-2xl bg-emerald-50/50 dark:bg-slate-900/40 border border-emerald-200 dark:border-slate-800 space-y-3">
          <h3 className="font-bold text-sm text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            {locale === 'es' ? 'La solución de @angelitosystems/nestjs-pdf' : 'The @angelitosystems/nestjs-pdf solution'}
          </h3>
          <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-2 list-disc list-inside leading-relaxed">
            <li>
              {locale === 'es'
                ? '9 submódulos desacoplados y tokens Symbol para inversión de dependencias real.'
                : '9 cohesive submodules and Symbol tokens for true dependency inversion.'}
            </li>
            <li>
              {locale === 'es'
                ? 'Pool de navegadores resiliente: BrowserContext y Page aislados y reciclaje programado.'
                : 'Resilient browser pool: isolated BrowserContext/Page per request with scheduled recycling.'}
            </li>
            <li>
              {locale === 'es'
                ? 'Capa de seguridad SSRF activa con pre-resolución DNS y validación estricta de rutas canónicas.'
                : 'Active SSRF defense layer with DNS pre-resolution and canonical path validation.'}
            </li>
            <li>
              {locale === 'es'
                ? 'Dependencia en playwright-core: binarios del sistema para Docker y 0 vulnerabilidades.'
                : 'Lightweight playwright-core dependency: use system binaries in Docker with 0 vulnerabilities.'}
            </li>
          </ul>
        </div>
      </div>

      {/* Core Principles */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          {locale === 'es' ? 'Principios Arquitectónicos' : 'Architectural Principles'}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-slate-100/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
              <Layers className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">
              {locale === 'es' ? 'Desacoplamiento Estricto' : 'Strict Decoupling'}
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {locale === 'es'
                ? 'El motor de renderizado, plantillas y storage son adapters intercambiables vía DI.'
                : 'Rendering engine, templates, and storage are hot-swappable adapters via DI.'}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-100/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold">
              <Cpu className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-slate-900 dark:text-white text-sm">
              {locale === 'es' ? 'Aislamiento Total' : 'Total Isolation'}
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {locale === 'es'
                ? 'Ninguna página ni cookie se comparte jamás entre peticiones concurrentes.'
                : 'No page or cookie state is ever leaked between concurrent user requests.'}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-100/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-slate-900 dark:text-white text-sm">
              {locale === 'es' ? 'Seguridad por Defecto' : 'Security by Default'}
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {locale === 'es'
                ? 'Peticiones a IPs privadas y metadatos de nube son bloqueadas inmediatamente.'
                : 'Requests to private subnets and cloud metadata endpoints are blocked immediately.'}
            </p>
          </div>
        </div>
      </div>

      {/* Snippet preview */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
          {locale === 'es' ? 'Vista previa en NestJS' : 'NestJS Quick Preview'}
        </h3>
        <CodeBlock
          filename="src/invoice.service.ts"
          code={`import { Injectable } from '@nestjs/common';
import { PdfService } from '@angelitosystems/nestjs-pdf';

@Injectable()
export class InvoiceService {
  constructor(private readonly pdfService: PdfService) {}

  async createInvoicePdf(invoice: InvoiceData): Promise<Buffer> {
    const result = await this.pdfService.generate({
      template: 'invoice',
      data: invoice,
      format: 'A4',
      printBackground: true,
      watermark: { text: 'PAID', opacity: 0.12 },
    });

    return result.toBuffer();
  }
}`}
        />
      </div>
    </div>
  );
}

