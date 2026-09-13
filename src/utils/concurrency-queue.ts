import { PdfAbortError, PdfTimeoutError } from '../pdf/pdf.exceptions';

interface QueueItem<T = unknown> {
  task: () => Promise<T>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  resolve: (value: any) => void;
  reject: (reason?: unknown) => void;
  signal?: AbortSignal;
  timeoutId?: NodeJS.Timeout;
  enqueuedAt: number;
}

export interface ConcurrencyQueueOptions {
  concurrency?: number;
  queueTimeout?: number;
  onWaiting?: (queueSize: number) => void;
  onCompleted?: () => void;
}

/**
 * Robust in-memory FIFO queue enforcing a maximum number of concurrent executions.
 */
export class ConcurrencyQueue {
  private activeCount = 0;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private readonly queue: Array<QueueItem<any>> = [];
  private isDestroyed = false;

  constructor(private readonly options: ConcurrencyQueueOptions = {}) {}

  public get concurrency(): number {
    return Math.max(1, this.options.concurrency ?? 5);
  }

  public get defaultQueueTimeout(): number {
    return this.options.queueTimeout ?? 30000;
  }

  public get pendingCount(): number {
    return this.queue.length;
  }

  public get runningCount(): number {
    return this.activeCount;
  }

  /**
   * Enqueues a task and executes it once a slot becomes available.
   */
  public run<T>(
    task: () => Promise<T>,
    options?: { timeoutMs?: number; signal?: AbortSignal },
  ): Promise<T> {
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
        resolve: resolve as (val: unknown) => void,
        reject,
        signal,
        enqueuedAt: Date.now(),
      };

      // Set timeout for waiting in queue
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

      // Handle abort while waiting in queue
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
      if (this.options.onWaiting) {
        this.options.onWaiting(this.queue.length);
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
    if (this.isDestroyed || this.activeCount >= this.concurrency || this.queue.length === 0) {
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

    // Execute task with slot management
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
        if (this.options.onCompleted) {
          this.options.onCompleted();
        }
        this.processNext();
      }
    };

    void execute();
  }

  /**
   * Gracefully shuts down the queue and rejects all pending tasks.
   */
  public destroy(reason = 'ConcurrencyQueue was shut down'): void {
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
