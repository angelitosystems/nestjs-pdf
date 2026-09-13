import { Inject, Injectable, Logger, Optional } from '@nestjs/common';
import { GeneratePdfOptions, HttpResponseLike, PdfEvent, PdfModuleOptions, PdfResult, SendHttpOptions } from '../common/types/pdf.types';
import { PDF_MODULE_OPTIONS } from '../common/constants/tokens.constants';
import { PdfRendererService } from '../renderer/renderer.service';
import { ConcurrencyQueueService } from '../queue/concurrency-queue.service';
import { StorageService } from '../storage/storage.service';
import { PdfResultImpl } from './pdf.result';

/**
 * Public facade service for generating and streaming PDF documents in NestJS.
 */
@Injectable()
export class PdfService {
  private readonly logger = new Logger(PdfService.name);
  private readonly isLoggingEnabled: boolean;

  constructor(
    private readonly renderer: PdfRendererService,
    private readonly queue: ConcurrencyQueueService,
    private readonly storage: StorageService,
    @Optional()
    @Inject(PDF_MODULE_OPTIONS)
    private readonly moduleOptions: PdfModuleOptions = {},
  ) {
    this.isLoggingEnabled = this.moduleOptions.logger?.enabled !== false;
  }

  /**
   * Generates a PDF asynchronously according to the provided options.
   */
  public async generate(options: GeneratePdfOptions): Promise<PdfResult> {
    const startTime = Date.now();
    const filename = options.filename || `document-${Date.now()}.pdf`;

    this.logInfo(`PDF generation started for: ${options.template || 'inline-html'}`);
    this.emitEvent('generation.started', {
      template: options.template,
      filename,
    });

    try {
      const buffer = await this.queue.run(
        async () => {
          return await this.renderer.render(options);
        },
        {
          signal: options.signal,
          timeoutMs: options.timeout ?? this.moduleOptions.queueTimeout,
        },
      );

      const durationMs = Date.now() - startTime;
      this.logInfo(`PDF generated successfully: ${filename} (${buffer.length} bytes, ${durationMs}ms)`);
      this.emitEvent('generation.completed', {
        filename,
        size: buffer.length,
        durationMs,
      });

      return new PdfResultImpl(buffer, filename, options.metadata, this.storage);
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err));
      this.logError(`PDF generation failed for "${filename}": ${error.message}`);
      this.emitEvent('generation.failed', { filename }, error);
      throw error;
    }
  }

  /**
   * Generates and immediately streams the PDF through an HTTP response (Express or Fastify).
   */
  public async send(
    response: HttpResponseLike,
    options: GeneratePdfOptions,
    httpOptions?: SendHttpOptions,
  ): Promise<void> {
    const result = await this.generate(options);
    await result.send(response, httpOptions);
  }

  private logInfo(message: string): void {
    if (this.isLoggingEnabled) {
      this.logger.log(message);
    }
  }

  private logError(message: string): void {
    if (this.isLoggingEnabled) {
      this.logger.error(message);
    }
  }

  private emitEvent(
    type: PdfEvent['type'],
    metadata?: Record<string, unknown>,
    error?: Error,
  ): void {
    if (this.moduleOptions.onEvent) {
      try {
        this.moduleOptions.onEvent({
          type,
          timestamp: new Date(),
          metadata,
          error,
        });
      } catch {
        // Suppress callback failure
      }
    }
  }
}
