import { CodeBlock } from '../../components/CodeBlock';
import { useI18n } from '../../hooks/useI18n';
import { Sliders, Clock, Ban } from 'lucide-react';

export function QueueSection() {
  const { locale } = useI18n();

  return (
    <div className="space-y-8 animate-fadeIn">
      <div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          {locale === 'es' ? 'Control de Concurrencia y Cola FIFO' : 'Concurrency Control & FIFO Queue'}
        </h1>
        <p className="mt-3 text-base text-slate-600 dark:text-slate-400 leading-relaxed">
          {locale === 'es'
            ? 'ConcurrencyQueueService previene caídas por sobrecarga de memoria limitando cuántos renderizados simultáneos pueden ejecutarse al mismo tiempo en el servidor.'
            : 'ConcurrencyQueueService prevents out-of-memory spikes by throttling how many concurrent Chromium rendering jobs run simultaneously.'}
        </p>
      </div>

      {/* Visual ASCII representation */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300 overflow-x-auto space-y-2">
        <div className="text-amber-400 font-bold">// FIFO Backpressure Queue</div>
        <pre className="text-slate-300 leading-relaxed">
{`Request 1 ──┐
Request 2 ──┤
Request 3 ──┼──▶ [ ConcurrencyQueueService ] ──▶ Browser Pool (Slots: limit=5)
Request 4 ──┤     (FIFO Order / queueTimeout)
Request 5 ──┘`}
        </pre>
      </div>

      {/* Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Sliders className="w-4 h-4" />
          </div>
          <h4 className="font-bold text-sm text-slate-900 dark:text-white">
            {locale === 'es' ? 'Límite de Concurrencia' : 'Concurrency Limit'}
          </h4>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            {locale === 'es'
              ? 'Controla cuántos PDFs se renderizan en paralelo para no agotar la RAM de la máquina.'
              : 'Caps how many PDFs render in parallel so server RAM is never exhausted.'}
          </p>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2">
          <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center">
            <Clock className="w-4 h-4" />
          </div>
          <h4 className="font-bold text-sm text-slate-900 dark:text-white">
            {locale === 'es' ? 'Timeout en Cola' : 'Queue Timeout'}
          </h4>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            {locale === 'es'
              ? 'Si una tarea espera más de queueTimeout sin recibir un slot, se rechaza con PdfTimeoutError.'
              : 'Rejects task with PdfTimeoutError if it waits in queue longer than queueTimeout.'}
          </p>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2">
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Ban className="w-4 h-4" />
          </div>
          <h4 className="font-bold text-sm text-slate-900 dark:text-white">
            AbortSignal Support
          </h4>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            {locale === 'es'
              ? 'Si el cliente cancela la conexión HTTP, la tarea se expulsa inmediatamente de la cola.'
              : 'If a client disconnects, the task is evicted from queue and stops browser execution.'}
          </p>
        </div>
      </div>

      {/* Code with AbortSignal */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
          {locale === 'es' ? 'Ejemplo con AbortSignal' : 'Cancellation with AbortSignal'}
        </h3>
        <CodeBlock
          filename="src/report.controller.ts"
          code={`import { Controller, Get, Req, Res } from '@nestjs/common';
import { PdfService } from '@angelitosystems/nestjs-pdf';
import type { Request, Response } from 'express';

@Controller('exports')
export class ExportController {
  constructor(private readonly pdfService: PdfService) {}

  @Get('report')
  async exportLargeReport(@Req() req: Request, @Res() res: Response) {
    const controller = new AbortController();

    // Cancel if HTTP client disconnects early
    req.on('close', () => controller.abort());

    const result = await this.pdfService.generate({
      template: 'large-report',
      data: { /* ... */ },
      signal: controller.signal,
    });

    await result.sendToHttp(res, { filename: 'large-report.pdf' });
  }
}`}
        />
      </div>
    </div>
  );
}
