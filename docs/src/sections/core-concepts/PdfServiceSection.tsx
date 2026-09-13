import { CodeBlock } from '../../components/CodeBlock';
import { useI18n } from '../../hooks/useI18n';

export function PdfServiceSection() {
  const { locale } = useI18n();

  return (
    <div className="space-y-8 animate-fadeIn">
      <div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          PdfService & PdfResult
        </h1>
        <p className="mt-3 text-base text-slate-600 dark:text-slate-400 leading-relaxed">
          {locale === 'es'
            ? 'PdfService es la fachada pública inyectable que encapsula la cola de concurrencia, el orquestador de renderizado y el servicio de almacenamiento.'
            : 'PdfService is the public injectable facade encapsulating the concurrency queue, rendering orchestrator, and persistent storage subsystem.'}
        </p>
      </div>

      {/* Methods Overview */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          {locale === 'es' ? 'Método Principal: generate()' : 'Primary Method: generate()'}
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
          {locale === 'es'
            ? 'Acepta GeneratePdfOptions (plantilla o HTML en línea, datos, formato, márgenes, marcas de agua, encabezados) y retorna un objeto PdfResult enriquecido:'
            : 'Accepts GeneratePdfOptions (template path or inline HTML, data payload, margins, watermarks, headers) and returns an enriched PdfResult instance:'}
        </p>
        <CodeBlock
          filename="src/report.service.ts"
          code={`import { Injectable } from '@nestjs/common';
import { PdfService, PdfResult } from '@angelitosystems/nestjs-pdf';

@Injectable()
export class ReportService {
  constructor(private readonly pdfService: PdfService) {}

  async generateReport(data: any): Promise<PdfResult> {
    const controller = new AbortController();
    
    // Auto-cancel if it takes longer than 15 seconds
    const timeout = setTimeout(() => controller.abort(), 15000);

    try {
      const result = await this.pdfService.generate({
        template: 'financial-report',
        data,
        signal: controller.signal, // Native cancellation support
        format: 'A4',
        landscape: false,
        printBackground: true,
      });

      return result;
    } finally {
      clearTimeout(timeout);
    }
  }
}`}
        />
      </div>

      {/* PdfResult Capabilities */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          {locale === 'es' ? 'Capacidades de PdfResult' : 'PdfResult Capabilities'}
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
          {locale === 'es'
            ? 'El resultado retornado por generate() no es un simple Buffer, sino un objeto estructurado que facilita su consumo en cualquier capa de tu arquitectura:'
            : 'The returned PdfResult is an abstraction wrapping the generated document with versatile consumption methods:'}
        </p>

        <div className="space-y-3">
          <div className="p-4 rounded-xl bg-slate-100/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
            <h4 className="font-mono text-xs font-bold text-rose-600 dark:text-rose-400">
              result.toBuffer(): Buffer
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              {locale === 'es'
                ? 'Obtiene el buffer binario en memoria para adjuntarlo a un email o procesarlo.'
                : 'Extracts the raw binary buffer in memory for email attachments or processing.'}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-100/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
            <h4 className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">
              result.toStream(): Readable
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              {locale === 'es'
                ? 'Convierte el buffer a un Readable Stream de Node.js para transferencias eficientes.'
                : 'Converts buffer to a Node.js Readable stream for piping and streaming.'}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-100/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
            <h4 className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
              result.save(destination: string): Promise&lt;string&gt;
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              {locale === 'es'
                ? 'Persiste el archivo a través del StorageAdapter configurado (disco local o S3).'
                : 'Persists document through the configured StorageAdapter (local disk or S3).'}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-100/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
            <h4 className="font-mono text-xs font-bold text-purple-600 dark:text-purple-400">
              result.sendToHttp(res: HttpResponseLike, options?: SendHttpOptions): Promise&lt;void&gt;
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              {locale === 'es'
                ? 'Envía el PDF en una respuesta HTTP compatible tanto con Express como con Fastify.'
                : 'Streams the PDF directly to an HTTP response supporting Express and Fastify.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
