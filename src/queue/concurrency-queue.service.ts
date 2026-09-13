import { Inject, Injectable, OnModuleDestroy, Optional } from '@nestjs/common';
import { PDF_MODULE_OPTIONS } from '../common/constants/tokens.constants';
import type { PdfModuleOptions } from '../common/types/pdf.types';
import { PdfAbortError, PdfTimeoutError } from '../common/exceptions/pdf.exceptions';
import { QueueTaskOptions } from './queue.types';

interface QueueItem<T = unknown> {
  task: () => Promise<T>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  resolve: (value: any) => void;
  reject: (reason?: unknown) => void;
  signal?: AbortSignal;
  timeoutId?: NodeJS.Timeout;
  enqueuedAt: number;
}

@Injectable()
export class ConcurrencyQueueService implements OnModuleDestroy {
  private activeCount = 0;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private readonly queue: Array<QueueItem<any>> = [];
  private isDestroyed = false;
  private readonly limit: number;
  private readonly defaultQueueTimeout: number;

  constructor(
    @Optional()
    @Inject(PDF_MODULE_OPTIONS)
    private readonly moduleOptions?: PdfModuleOptions,
  ) {
    this.limit = Math.max(
      1,
      moduleOptions?.queue?.concurrency ?? moduleOptions?.concurrency ?? 5,
    );
    this.defaultQueueTimeout =
      moduleOptions?.queue?.queueTimeout ?? moduleOptions?.queueTimeout ?? 30000;
  }

  public get concurrency(): number {
    return this.limit;
  }

  public get pendingCount(): number {
    return this.queue.length;
  }

  public get runningCount(): number {
    return this.activeCount;
  }

  public onModuleDestroy(): void {
    this.destroy('ConcurrencyQueueService destroyed during application shutdown');
  }

  public run<T>(task: () => Promise<T>, options?: QueueTaskOptions): Promise<T> {
    if (this.isDestroyed) {
      return Promise.reject(
        new PdfAbortError('ConcurrencyQueue is shut down and not accepting new tasks'),
      );
    }

    const signal = options?.signal;
    if (signal?.aborted) {
      return Promise.reject(new PdfAbortError('Task was aborted before entering queue'));
    }

    const queueTimeoutMs = options?.timeoutMs ?? this.defaultQueueTimeout;

    return new Promise<T>((resolve, reject) => {
      const item: QueueItem<T> = {
        task,
        resolve,
        reject,
        signal,
        enqueuedAt: Date.now(),
      };

      if (queueTimeoutMs > 0 && queueTimeoutMs !== Infinity) {
        item.timeoutId = setTimeout(() => {
          this.removeItem(item);
          reject(
            new PdfTimeoutError(
              'PDF generation request waited in queue too long',
              queueTimeoutMs,
            ),
          );
        }, queueTimeoutMs);
      }

      if (signal) {
        const onAbort = () => {
          if (item.timeoutId) clearTimeout(item.timeoutId);
          this.removeItem(item);
          signal.removeEventListener('abort', onAbort);
          reject(new PdfAbortError('Task was aborted while waiting in queue'));
        };
        signal.addEventListener('abort', onAbort, { once: true });
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this.queue.push(item as QueueItem<any>);

      if (this.moduleOptions?.onEvent) {
        this.moduleOptions.onEvent({
          type: 'queue.waiting',
          timestamp: new Date(),
          metadata: { queueSize: this.queue.length },
        });
      }

      this.processNext();
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private removeItem(item: QueueItem<any>): void {
    const index = this.queue.indexOf(item);
    if (index !== -1) {
      this.queue.splice(index, 1);
    }
  }

  private processNext(): void {
    if (this.isDestroyed || this.activeCount >= this.limit || this.queue.length === 0) {
      return;
    }

    const item = this.queue.shift();
    if (!item) return;

    if (item.timeoutId) {
      clearTimeout(item.timeoutId);
      item.timeoutId = undefined;
    }

    if (item.signal?.aborted) {
      item.reject(new PdfAbortError('Task was aborted before execution'));
      this.processNext();
      return;
    }

    this.activeCount++;

    const execute = async () => {
      try {
        if (item.signal?.aborted) {
          throw new PdfAbortError('Task was aborted before execution');
        }
        const result = await item.task();
        item.resolve(result);
      } catch (err) {
        item.reject(err);
      } finally {
        this.activeCount--;
        if (this.moduleOptions?.onEvent) {
          this.moduleOptions.onEvent({
            type: 'queue.completed',
            timestamp: new Date(),
          });
        }
        this.processNext();
      }
    };

    void execute();
  }

  public destroy(reason = 'Queue was shut down'): void {
    this.isDestroyed = true;
    while (this.queue.length > 0) {
      const item = this.queue.shift();
      if (item) {
        if (item.timeoutId) clearTimeout(item.timeoutId);
        item.reject(new PdfAbortError(reason));
      }
    }
  }
}

