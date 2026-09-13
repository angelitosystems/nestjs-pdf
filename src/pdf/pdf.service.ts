import {
  Inject,
  Injectable,
  Logger,
  OnModuleDestroy,
  Optional,
} from '@nestjs/common';
import { GeneratePdfOptions, HttpResponseLike, PdfEvent, PdfModuleOptions, PdfResult, SendHttpOptions } from './pdf.types';
import { PDF_MODULE_OPTIONS, STORAGE_ADAPTER } from './pdf.constants';
import { RendererService } from '../rendering/renderer.service';
import { StorageAdapter } from '../storage/storage.interface';
import { ConcurrencyQueue } from '../utils/concurrency-queue';
import { PdfResultImpl } from './pdf.result';
import { LocalStorageAdapter } from '../storage/local.storage';

@Injectable()
export class PdfService implements OnModuleDestroy {
  private readonly logger = new Logger(PdfService.name);
  private readonly queue: ConcurrencyQueue;
  private readonly storage: StorageAdapter;
  private readonly isLoggingEnabled: boolean;

  constructor(
    private readonly renderer: RendererService,
    @Optional()
    @Inject(STORAGE_ADAPTER)
    storageAdapter?: StorageAdapter,
    @Optional()
    @Inject(PDF_MODULE_OPTIONS)
    private readonly moduleOptions: PdfModuleOptions = {},
  ) {
    this.isLoggingEnabled = this.moduleOptions.logger?.enabled !== false;
    this.storage = storageAdapter || new LocalStorageAdapter();

    this.queue = new ConcurrencyQueue({
      concurrency: this.moduleOptions.concurrency ?? 5,
      queueTimeout: this.moduleOptions.queueTimeout ?? 30000,
      onWaiting: (queueSize) => {
        this.emitEvent('queue.waiting', { queueSize });
      },
      onCompleted: () => {
        this.emitEvent('queue.completed');
      },
    });
  }

  public onModuleDestroy(): void {
    this.queue.destroy('PdfService is shutting down');
  }

  /**
   * Generates a PDF document asynchronously according to provided options.
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
          return await this.renderer.renderPdf(options);
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
   * Generates and immediately streams the PDF to an HTTP response (Express or Fastify).
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
        // Suppress event listener failure
      }
    }
  }
}

