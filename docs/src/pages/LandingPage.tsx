import { Terminal } from '../components/Terminal';
import { FeatureCard } from '../components/FeatureCard';
import { CodeBlock } from '../components/CodeBlock';
import { metricsData } from '../data/metrics';
import { useI18n } from '../hooks/useI18n';
import {
  Sparkles,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
  onNavigate: (sectionId: string, itemId: string) => void;
}

export function LandingPage({ onGetStarted, onNavigate }: LandingPageProps) {
  const { locale, t } = useI18n();

  return (
    <div className="space-y-24 py-8 animate-fadeIn">
      {/* 1. HERO SECTION */}
      <section className="text-center max-w-4xl mx-auto px-4 space-y-6">
        {/* Built for NestJS Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 text-xs font-semibold shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
          <span>{t.common.builtForNestjs}</span>
          <span className="w-1 h-1 rounded-full bg-rose-500" />
          <span className="font-mono">v0.1.0</span>
        </div>

        {/* Powerful Title */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15]">
          {locale === 'es' ? (
            <>
              Generación de PDFs de nivel{' '}
              <span className="bg-gradient-to-r from-rose-600 via-red-500 to-amber-500 bg-clip-text text-transparent">
                empresarial
              </span>{' '}
              para NestJS.
            </>
          ) : (
            <>
              Production-ready PDF generation for{' '}
              <span className="bg-gradient-to-r from-rose-600 via-red-500 to-amber-500 bg-clip-text text-transparent">
                NestJS.
              </span>
            </>
          )}
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
          {t.landing.heroSubtitle}
        </p>

        {/* CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            onClick={onGetStarted}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-semibold text-sm shadow-lg shadow-rose-600/25 transition-all hover:scale-[1.02] cursor-pointer"
          >
            <span>{t.common.getStarted}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <a
            href="https://www.npmjs.com/package/@angelitosystems/nestjs-pdf"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-200 font-semibold text-sm transition-all shadow-sm"
          >
            <span>{t.common.viewOnNpm}</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
          </a>

          <a
            href="https://github.com/AngelitoSystems/nestjs-pdf"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-200 font-semibold text-sm transition-all shadow-sm"
          >
            <span>GitHub</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
          </a>
        </div>

        {/* Interactive Quick Install Terminal */}
        <div className="pt-6 max-w-2xl mx-auto text-left">
          <Terminal />
        </div>
      </section>

      {/* 2. REAL METRICS & STATS */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {metricsData.map((stat, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-2xl border text-center transition-all ${
                stat.highlight
                  ? 'bg-rose-50/50 dark:bg-rose-500/5 border-rose-200 dark:border-rose-500/20'
                  : 'bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-800'
              }`}
            >
              <div className="text-xl sm:text-2xl font-mono font-extrabold text-slate-900 dark:text-white">
                {stat.value}
              </div>
              <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-1">
                {locale === 'es' ? stat.labelEs : stat.labelEn}
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                {locale === 'es' ? stat.subEs : stat.subEn}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. FEATURE GRID: Why @angelitosystems/nestjs-pdf */}
      <section className="max-w-6xl mx-auto px-4 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {t.landing.whyTitle}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            {t.landing.whySubtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {t.features.map((feat) => (
            <FeatureCard
              key={feat.id}
              id={feat.id}
              title={feat.title}
              description={feat.description}
            />
          ))}
        </div>
      </section>

      {/* 4. CODE SHOWCASE: Clean NestJS API */}
      <section className="max-w-6xl mx-auto px-4 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {locale === 'es' ? 'Experiencia de Uso Nativa de NestJS' : 'Developer Experience: Truly NestJS'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            {locale === 'es'
              ? 'Sin hacks ni scripts monolíticos. Se integra armónicamente con módulos, controladores y DI.'
              : 'Zero boilerplate hacks. Perfectly aligned with NestJS modules, controllers, and dependency injection.'}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <div className="space-y-3">
            <h3 className="text-xs font-bold font-mono text-rose-600 dark:text-rose-400 uppercase tracking-wider">
              // 1. Module Configuration
            </h3>
            <CodeBlock
              filename="src/app.module.ts"
              code={`import { Module } from '@nestjs/common';
import { PdfModule } from '@angelitosystems/nestjs-pdf';

@Module({
  imports: [
    PdfModule.forRoot({
      templatesPath: './templates',
      concurrency: 5,
      browser: { min: 1, max: 3 },
      security: { allowExternalResources: false },
    }),
  ],
})
export class AppModule {}`}
            />
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-bold font-mono text-blue-600 dark:text-blue-400 uppercase tracking-wider">
              // 2. Controller & HTTP Streaming
            </h3>
            <CodeBlock
              filename="src/invoice.controller.ts"
              code={`@Controller('invoices')
export class InvoiceController {
  constructor(private readonly pdfService: PdfService) {}

  @Get(':id/pdf')
  async download(@Res() res: Response) {
    const pdf = await this.pdfService.generate({
      template: 'invoice',
      data: { id: 'INV-2026-01', total: 1499.0 },
      watermark: { text: 'PAID', opacity: 0.12 },
    });

    // Directly stream to Express or Fastify
    await pdf.send(res, { filename: 'invoice.pdf' });
  }
}`}
            />
          </div>
        </div>
      </section>

      {/* 5. CALL TO ACTION BANNER */}
      <section className="max-w-4xl mx-auto px-4">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-tr from-slate-900 via-slate-900 to-rose-950/40 border border-slate-800 shadow-2xl text-center space-y-6 relative overflow-hidden">
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {t.landing.ctaTitle}
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto leading-relaxed">
              {t.landing.ctaSubtitle}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={onGetStarted}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-sm shadow-lg shadow-rose-600/30 transition-all cursor-pointer"
            >
              <span>{t.common.getStarted}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigate('deployment', 'docker-deployment')}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm transition-all cursor-pointer"
            >
              <span>{locale === 'es' ? 'Ver Receta Docker' : 'View Docker Recipe'}</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
