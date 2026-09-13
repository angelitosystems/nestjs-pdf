import { chromium, firefox, webkit, Browser, BrowserType, LaunchOptions } from 'playwright-core';
import { BrowserPoolOptions, PdfEventListener } from '../pdf/pdf.types';
import { PdfEngineError } from '../pdf/pdf.exceptions';

interface PooledBrowser {
  id: string;
  browser: Browser;
  operationsCount: number;
  inUseCount: number;
  createdAt: number;
}

/**
 * Manages a resilient pool of reusable Playwright Browser instances.
 */
export class BrowserPool {
  private readonly min: number;
  private readonly max: number;
  private readonly maxOperationsPerBrowser: number;
  private readonly browsers: PooledBrowser[] = [];
  private isShuttingDown = false;
  private browserCounter = 0;

  constructor(
    private readonly options: BrowserPoolOptions = {},
    private readonly onEvent?: PdfEventListener,
  ) {
    this.min = Math.max(1, options.min ?? 1);
    this.max = Math.max(this.min, options.max ?? 5);
    this.maxOperationsPerBrowser = Math.max(1, options.maxOperationsPerBrowser ?? 100);
  }

  /**
   * Initializes the pool by pre-warming minimum browser instances.
   */
  public async initialize(): Promise<void> {
    const launchPromises: Array<Promise<void>> = [];
    for (let i = 0; i < this.min; i++) {
      launchPromises.push(
        this.launchNewBrowser().then((b) => {
          this.browsers.push(b);
        }),
      );
    }
    await Promise.all(launchPromises);
  }

  /**
   * Acquires a healthy browser instance from the pool or launches a new one if permitted.
   */
  public async acquire(): Promise<PooledBrowser> {
    if (this.isShuttingDown) {
      throw new PdfEngineError('Cannot acquire browser: pool is shutting down');
    }

    // 1. Clean up dead or exhausted browsers
    await this.cleanupStaleBrowsers();

    // 2. Look for an existing healthy browser with operations below threshold
    let candidate = this.browsers.find(
      (b) => b.browser.isConnected() && b.operationsCount < this.maxOperationsPerBrowser,
    );

    // 3. If no candidate found and we haven't reached max browsers, launch a new one
    if (!candidate && this.browsers.length < this.max) {
      candidate = await this.launchNewBrowser();
      this.browsers.push(candidate);
    }

    // 4. If still no candidate (all are at capacity or max reached), choose the connected one with lowest active usage
    if (!candidate) {
      const healthyBrowsers = this.browsers.filter((b) => b.browser.isConnected());
      if (healthyBrowsers.length > 0) {
        healthyBrowsers.sort((a, b) => a.inUseCount - b.inUseCount);
        candidate = healthyBrowsers[0];
      }
    }

    // 5. If all browsers crashed or were disconnected, force launch a new one
    if (!candidate) {
      candidate = await this.launchNewBrowser();
      this.browsers.push(candidate);
    }

    candidate.inUseCount++;
    candidate.operationsCount++;

    return candidate;
  }

  /**
   * Releases a browser back to the pool after an operation completes.
   * Recycles the browser if it reached max operations.
   */
  public async release(pooled: PooledBrowser): Promise<void> {
    pooled.inUseCount = Math.max(0, pooled.inUseCount - 1);

    // If browser is disconnected, remove it immediately
    if (!pooled.browser.isConnected()) {
      await this.destroyBrowser(pooled);
      await this.ensureMinimumBrowsers();
      return;
    }

    // If browser exceeded its lifetime operation quota and is no longer in use, recycle it
    if (pooled.operationsCount >= this.maxOperationsPerBrowser && pooled.inUseCount === 0) {
      this.emitEvent('browser.recycled', {
        browserId: pooled.id,
        operations: pooled.operationsCount,
      });

      await this.destroyBrowser(pooled);
      await this.ensureMinimumBrowsers();
    }
  }

  /**
   * Closes all browsers and drains the pool.
   */
  public async closeAll(): Promise<void> {
    this.isShuttingDown = true;
    const browsersToClose = [...this.browsers];
    this.browsers.length = 0;
    const closePromises = browsersToClose.map(async (b) => {
      try {
        if (b.browser.isConnected()) {
          await b.browser.close();
        }
      } catch {
        // Suppress cleanup error
      }
    });
    await Promise.allSettled(closePromises);
  }

  private async launchNewBrowser(): Promise<PooledBrowser> {
    const browserType = this.resolveBrowserType();
    const launchOptions: LaunchOptions = {
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--no-zygote',
        '--font-render-hinting=medium',
      ],
      ...this.options.launchOptions,
    };

    if (this.options.executablePath) {
      launchOptions.executablePath = this.options.executablePath;
    }

    try {
      const browser = await browserType.launch(launchOptions);
      this.browserCounter++;
      const pooled: PooledBrowser = {
        id: `browser_${this.browserCounter}_${Date.now()}`,
        browser,
        operationsCount: 0,
        inUseCount: 0,
        createdAt: Date.now(),
      };

      // Listen for browser unexpected disconnect
      browser.on('disconnected', () => {
        this.emitEvent('browser.error', {
          browserId: pooled.id,
          reason: 'Browser unexpectedly disconnected',
        });
        void this.destroyBrowser(pooled);
      });

      this.emitEvent('browser.created', {
        browserId: pooled.id,
        totalInPool: this.browsers.length + 1,
      });

      return pooled;
    } catch (err) {
      const error =
        err instanceof Error
          ? err
          : new Error(`Failed to launch browser: ${String(err)}`);
      this.emitEvent('browser.error', { error: error.message });
      throw new PdfEngineError(
        `Failed to launch Playwright browser. Ensure Chromium is installed via "npx playwright install chromium" or provide executablePath. Details: ${error.message}`,
        error,
      );
    }
  }

  private async destroyBrowser(pooled: PooledBrowser): Promise<void> {
    const idx = this.browsers.indexOf(pooled);
    if (idx !== -1) {
      this.browsers.splice(idx, 1);
    }
    try {
      if (pooled.browser.isConnected()) {
        await pooled.browser.close();
      }
    } catch {
      // Ignore errors during browser cleanup
    }
  }

  private async cleanupStaleBrowsers(): Promise<void> {
    const dead = this.browsers.filter(
      (b) => !b.browser.isConnected() || (b.operationsCount >= this.maxOperationsPerBrowser && b.inUseCount === 0),
    );
    for (const b of dead) {
      await this.destroyBrowser(b);
    }
  }

  private async ensureMinimumBrowsers(): Promise<void> {
    if (this.isShuttingDown) return;
    while (this.browsers.length < this.min) {
      try {
        const b = await this.launchNewBrowser();
        this.browsers.push(b);
      } catch {
        break; // If launch fails, don't loop infinitely
      }
    }
  }

  private resolveBrowserType(): BrowserType {
    const type = this.options.browserType ?? 'chromium';
    switch (type) {
      case 'firefox':
        return firefox;
      case 'webkit':
        return webkit;
      case 'chromium':
      default:
        return chromium;
    }
  }

  private emitEvent(type: 'browser.created' | 'browser.recycled' | 'browser.error', metadata?: Record<string, unknown>): void {
    if (this.onEvent) {
      this.onEvent({
        type,
        timestamp: new Date(),
        metadata,
      });
    }
  }
}
