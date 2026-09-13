import { CodeBlock } from '../../components/CodeBlock';
import { useI18n } from '../../hooks/useI18n';

export function ConfigurationSection() {
  const { locale } = useI18n();

  return (
    <div className="space-y-8 animate-fadeIn">
      <div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          {locale === 'es' ? 'Configuración Completa' : 'Complete Configuration'}
        </h1>
        <p className="mt-3 text-base text-slate-600 dark:text-slate-400 leading-relaxed">
          {locale === 'es'
            ? 'Explora todas las opciones configurables disponibles en PdfModuleOptions tanto para forRoot() como para forRootAsync().'
            : 'Explore all configurable options available in PdfModuleOptions for both forRoot() and forRootAsync().'}
        </p>
      </div>

      {/* Comprehensive Configuration Code Example */}
      <div className="space-y-3">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          {locale === 'es' ? 'Ejemplo de Configuración Exhaustiva' : 'Exhaustive Configuration Example'}
        </h2>
        <CodeBlock
          filename="src/app.module.ts"
          code={`import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PdfModule } from '@angelitosystems/nestjs-pdf';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PdfModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        // Templates directory
        templatesPath: config.get<string>('PDF_TEMPLATES_PATH', './templates'),

        // Browser pool management
        browser: {
          min: 1,                          // Minimum standby browsers
          max: 4,                          // Maximum concurrent browser instances
          maxOperationsPerBrowser: 50,     // Recycles browser after 50 jobs (prevents leaks)
          launchOptions: {
            executablePath: config.get<string>('CHROMIUM_PATH'),
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
          },
        },

        // Backpressure queue
        concurrency: {
          limit: 10,                       // Max concurrent rendering operations
          queueTimeout: 30000,             // Max ms a task can wait in queue before error
        },

        // Security controls
        security: {
          allowExternalResources: false,   // If true, validates against allowedDomains & SSRF
          allowedDomains: ['cdn.mycompany.com', 'assets.mycompany.com'],
          allowedAssetPaths: ['./assets', './templates'],
          maxAssetSizeBytes: 10 * 1024 * 1024, // 10 MB per asset
        },

        // Template cache
        cache: {
          enabled: true,
          ttl: 3600,                       // Cache compiled Handlebars delegates
        },

        // Default storage location
        storage: {
          basePath: './storage/pdfs',
        },

        // Global PDF generation defaults
        defaults: {
          format: 'A4',
          printBackground: true,
          margins: { top: '15mm', right: '15mm', bottom: '15mm', left: '15mm' },
        },
      }),
    }),
  ],
})
export class AppModule {}`}
        />
      </div>

      {/* Options Table */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          {locale === 'es' ? 'Referencia de Parámetros' : 'Parameters Reference'}
        </h2>
        <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 dark:bg-slate-950/80 text-slate-600 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-3">Option</th>
                <th className="p-3">Type</th>
                <th className="p-3">Default</th>
                <th className="p-3">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-mono text-[11px]">
              <tr>
                <td className="p-3 text-rose-600 dark:text-rose-400 font-bold">templatesPath</td>
                <td className="p-3 text-slate-600 dark:text-slate-300">string</td>
                <td className="p-3 text-slate-500">'./templates'</td>
                <td className="p-3 font-sans text-slate-600 dark:text-slate-400">
                  {locale === 'es' ? 'Ruta base a las plantillas en disco.' : 'Base directory containing template files.'}
                </td>
              </tr>
              <tr>
                <td className="p-3 text-rose-600 dark:text-rose-400 font-bold">browser.min</td>
                <td className="p-3 text-slate-600 dark:text-slate-300">number</td>
                <td className="p-3 text-slate-500">1</td>
                <td className="p-3 font-sans text-slate-600 dark:text-slate-400">
                  {locale === 'es' ? 'Navegadores inicializados en espera.' : 'Warm standby browsers in pool.'}
                </td>
              </tr>
              <tr>
                <td className="p-3 text-rose-600 dark:text-rose-400 font-bold">browser.max</td>
                <td className="p-3 text-slate-600 dark:text-slate-300">number</td>
                <td className="p-3 text-slate-500">5</td>
                <td className="p-3 font-sans text-slate-600 dark:text-slate-400">
                  {locale === 'es' ? 'Límite máximo de instancias Chromium.' : 'Maximum Chromium browser instances.'}
                </td>
              </tr>
              <tr>
                <td className="p-3 text-rose-600 dark:text-rose-400 font-bold">browser.maxOperationsPerBrowser</td>
                <td className="p-3 text-slate-600 dark:text-slate-300">number</td>
                <td className="p-3 text-slate-500">100</td>
                <td className="p-3 font-sans text-slate-600 dark:text-slate-400">
                  {locale === 'es' ? 'Cierra y recrea el navegador tras N operaciones.' : 'Recycles browser after N operations.'}
                </td>
              </tr>
              <tr>
                <td className="p-3 text-rose-600 dark:text-rose-400 font-bold">concurrency.limit</td>
                <td className="p-3 text-slate-600 dark:text-slate-300">number</td>
                <td className="p-3 text-slate-500">5</td>
                <td className="p-3 font-sans text-slate-600 dark:text-slate-400">
                  {locale === 'es' ? 'Límite de tareas concurrentes simultáneas.' : 'Concurrent generation concurrency slot ceiling.'}
                </td>
              </tr>
              <tr>
                <td className="p-3 text-rose-600 dark:text-rose-400 font-bold">security.allowExternalResources</td>
                <td className="p-3 text-slate-600 dark:text-slate-300">boolean</td>
                <td className="p-3 text-slate-500">false</td>
                <td className="p-3 font-sans text-slate-600 dark:text-slate-400">
                  {locale === 'es' ? 'Permite peticiones HTTP remotas en plantillas.' : 'Allows external HTTP asset requests in templates.'}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

