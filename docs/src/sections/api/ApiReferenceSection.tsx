import { CodeBlock } from '../../components/CodeBlock';
import { useI18n } from '../../hooks/useI18n';

export function ApiReferenceSection() {
  const { locale } = useI18n();

  return (
    <div className="space-y-8 animate-fadeIn">
      <div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          {locale === 'es' ? 'Referencia de la API' : 'API Reference'}
        </h1>
        <p className="mt-3 text-base text-slate-600 dark:text-slate-400 leading-relaxed">
          {locale === 'es'
            ? 'Especificación técnica completa de los tipos, clases abstractas y tokens de inyección de dependencias exportados por el paquete.'
            : 'Comprehensive technical specification of types, abstract classes, and dependency injection tokens exported by the package.'}
        </p>
      </div>

      {/* Tokens */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          {locale === 'es' ? 'Tokens de Inyección (Symbol)' : 'Injection Tokens (Symbol)'}
        </h2>
        <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 dark:bg-slate-950/80 text-slate-600 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-3">Constant Token</th>
                <th className="p-3">Type</th>
                <th className="p-3">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-mono text-[11px]">
              <tr>
                <td className="p-3 text-rose-600 dark:text-rose-400 font-bold">PDF_MODULE_OPTIONS</td>
                <td className="p-3 text-slate-500">Symbol('PDF_MODULE_OPTIONS')</td>
                <td className="p-3 font-sans text-slate-600 dark:text-slate-400">
                  {locale === 'es' ? 'Opciones de configuración del módulo.' : 'Module configuration options provider.'}
                </td>
              </tr>
              <tr>
                <td className="p-3 text-purple-600 dark:text-purple-400 font-bold">PDF_ENGINE</td>
                <td className="p-3 text-slate-500">Symbol('PDF_ENGINE')</td>
                <td className="p-3 font-sans text-slate-600 dark:text-slate-400">
                  {locale === 'es' ? 'Contrato del motor de renderizado PDF (Playwright).' : 'PDF rendering engine contract (Playwright).'}
                </td>
              </tr>
              <tr>
                <td className="p-3 text-cyan-600 dark:text-cyan-400 font-bold">TEMPLATE_ENGINE</td>
                <td className="p-3 text-slate-500">Symbol('TEMPLATE_ENGINE')</td>
                <td className="p-3 font-sans text-slate-600 dark:text-slate-400">
                  {locale === 'es' ? 'Contrato del motor de plantillas (Handlebars).' : 'Template engine contract (Handlebars).'}
                </td>
              </tr>
              <tr>
                <td className="p-3 text-emerald-600 dark:text-emerald-400 font-bold">STORAGE_ADAPTER</td>
                <td className="p-3 text-slate-500">Symbol('STORAGE_ADAPTER')</td>
                <td className="p-3 font-sans text-slate-600 dark:text-slate-400">
                  {locale === 'es' ? 'Contrato del adaptador de persistencia (LocalStorage, S3).' : 'Storage persistence adapter contract (LocalStorage, S3).'}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* GeneratePdfOptions Interface */}
      <div className="space-y-3">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          GeneratePdfOptions
        </h2>
        <CodeBlock
          filename="src/common/types/pdf.types.ts"
          code={`export interface GeneratePdfOptions {
  template?: string;                   // Template name or relative path
  html?: string;                       // Raw inline HTML string
  data?: Record<string, any>;          // Data payload passed to template
  format?: 'A4' | 'A3' | 'Letter' ...; // Paper format
  landscape?: boolean;                 // Orientation
  margins?: PdfMargins;                // Top, right, bottom, left margins
  printBackground?: boolean;           // Print background graphics (default true)
  watermark?: PdfWatermark;            // Watermark configuration
  headerFooter?: PdfHeaderFooter;      // Header & footer templates
  signal?: AbortSignal;                // Cancellation signal
  timeout?: number;                    // Task execution timeout in ms
  fonts?: PdfFont[];                   // Custom fonts to inject
}`}
        />
      </div>

      {/* Abstract Classes */}
      <div className="space-y-3">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          {locale === 'es' ? 'Clases Abstractas para Adaptadores' : 'Abstract Classes for Custom Adapters'}
        </h2>
        <CodeBlock
          filename="src/index.ts"
          code={`// Storage Adapter
export abstract class StorageAdapter {
  abstract save(buffer: Buffer, destination: string, options?: StorageSaveOptions): Promise<string>;
  abstract exists(destination: string): Promise<boolean>;
  abstract read(destination: string): Promise<Buffer>;
  abstract delete(destination: string): Promise<void>;
}

// PDF Engine Adapter
export abstract class PdfEngine {
  abstract render(html: string, options: EngineRenderOptions): Promise<Buffer>;
  abstract close?(): Promise<void>;
}

// Template Engine Adapter
export abstract class TemplateEngine {
  abstract render(templateNameOrContent: string, data: Record<string, any>, options?: RenderTemplateOptions): Promise<string>;
  abstract registerHelper?(name: string, fn: (...args: any[]) => any): void;
}`}
        />
      </div>
    </div>
  );
}

