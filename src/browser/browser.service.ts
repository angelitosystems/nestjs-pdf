import { Injectable } from '@nestjs/common';
import { Page, BrowserContext } from 'playwright-core';
import { BrowserPoolService } from './browser-pool.service';
import { PdfAbortError, PdfEngineError } from '../common/exceptions/pdf.exceptions';

@Injectable()
export class BrowserService {
  constructor(private readonly pool: BrowserPoolService) {}

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

      // Fresh context per request
      context = await pooledBrowser.browser.newContext({
        ignoreHTTPSErrors: false,
        javaScriptEnabled: true,
      });

      if (signal?.aborted) {
        throw new PdfAbortError('Operation was aborted after creating browser context');
      }

      // Fresh page per request
      page = await context.newPage();

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
      if (page) {
        try {
          await page.close();
        } catch {
          // Ignore
        }
      }

      if (context) {
        try {
          await context.close();
        } catch {
          // Ignore
        }
      }

      await this.pool.release(pooledBrowser);
    }
  }

  public getPool(): BrowserPoolService {
    return this.pool;
  }
}
