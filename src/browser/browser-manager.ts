import { Inject, Injectable, OnModuleDestroy, OnModuleInit, Optional } from '@nestjs/common';
import { Page, BrowserContext } from 'playwright-core';
import { BrowserPool } from './browser-pool';
import { PDF_MODULE_OPTIONS } from '../pdf/pdf.constants';
import { PdfModuleOptions } from '../pdf/pdf.types';
import { PdfAbortError, PdfEngineError } from '../pdf/pdf.exceptions';

@Injectable()
export class BrowserManager implements OnModuleInit, OnModuleDestroy {
  private readonly pool: BrowserPool;

  constructor(
    @Optional()
    @Inject(PDF_MODULE_OPTIONS)
    private readonly moduleOptions: PdfModuleOptions = {},
  ) {
    this.pool = new BrowserPool(
      this.moduleOptions.browser,
      this.moduleOptions.onEvent,
    );
  }

  public async onModuleInit(): Promise<void> {
    // Only pre-warm if min > 0
    if ((this.moduleOptions.browser?.min ?? 1) > 0) {
      try {
        await this.pool.initialize();
      } catch {
        // Pool can initialize lazily on first request if pre-warming encounters an issue
      }
    }
  }

  public async onModuleDestroy(): Promise<void> {
    await this.pool.closeAll();
  }

  /**
   * Executes an isolated operation inside a fresh BrowserContext and Page.
   * Guarantees strict cleanup of both Page and Context in finally block.
   */
  public async runWithPage<T>(
    operation: (page: Page) => Promise<T>,
    options?: { signal?: AbortSignal },
  ): Promise<T> {
    const signal = options?.signal;
    if (signal?.aborted) {
      throw new PdfAbortError('Operation was aborted before acquiring browser');
    }

    const pooledBrowser = await this.pool.acquire();
    let context: BrowserContext | null = null;
    let page: Page | null = null;

    try {
      if (signal?.aborted) {
        throw new PdfAbortError('Operation was aborted after acquiring browser');
      }

      // 1. Create brand new context per request (NO context reuse)
      context = await pooledBrowser.browser.newContext({
        ignoreHTTPSErrors: false,
        javaScriptEnabled: true,
      });

      if (signal?.aborted) {
        throw new PdfAbortError('Operation was aborted after creating browser context');
      }

      // 2. Create brand new page per request (NO page reuse)
      page = await context.newPage();

      // Hook up abort signal listener to cancel page operations immediately if aborted
      let abortHandler: (() => void) | undefined;
      if (signal) {
        abortHandler = () => {
          if (page) {
            void page.close().catch(() => {});
          }
        };
        signal.addEventListener('abort', abortHandler, { once: true });
      }

      try {
        return await operation(page);
      } finally {
        if (signal && abortHandler) {
          signal.removeEventListener('abort', abortHandler);
        }
      }
    } catch (err) {
      if (signal?.aborted) {
        throw new PdfAbortError(
          `Operation cancelled: ${err instanceof Error ? err.message : String(err)}`,
        );
      }
      if (err instanceof PdfAbortError || err instanceof PdfEngineError) {
        throw err;
      }
      throw new PdfEngineError(
        `Error during browser execution: ${err instanceof Error ? err.message : String(err)}`,
        err instanceof Error ? err : undefined,
      );
    } finally {
      // 3. Guarantee ALWAYS closing Page and Context in finally block
      if (page) {
        try {
          await page.close();
        } catch {
          // Page already closed or crashed
        }
      }

      if (context) {
        try {
          await context.close();
        } catch {
          // Context already closed or crashed
        }
      }

      // 4. Release browser back to pool
      await this.pool.release(pooledBrowser);
    }
  }

  /**
   * Exposes pool directly for testing or inspection.
   */
  public getPool(): BrowserPool {
    return this.pool;
  }
}

