import { Inject, Injectable, OnModuleDestroy, OnModuleInit, Optional } from '@nestjs/common';
import { PDF_MODULE_OPTIONS } from '../common/constants/tokens.constants';
import type { PdfModuleOptions } from '../common/types/pdf.types';
import { PdfEngineError } from '../common/exceptions/pdf.exceptions';
import { BrowserManagerService } from './browser-manager.service';
import { PooledBrowser } from './browser.types';
import { DEFAULT_BROWSER_MAX, DEFAULT_BROWSER_MIN, DEFAULT_MAX_OPERATIONS } from './browser.constants';

@Injectable()
export class BrowserPoolService implements OnModuleInit, OnModuleDestroy {
  private readonly min: number;
  private readonly max: number;
  private readonly maxOperationsPerBrowser: number;
  private readonly browsers: PooledBrowser[] = [];
  private isShuttingDown = false;

  constructor(
    private readonly manager: BrowserManagerService,
    @Optional()
    @Inject(PDF_MODULE_OPTIONS)
    private readonly moduleOptions?: PdfModuleOptions,
  ) {
    this.min = Math.max(0, moduleOptions?.browser?.min ?? DEFAULT_BROWSER_MIN);
    this.max = Math.max(Math.max(1, this.min), moduleOptions?.browser?.max ?? DEFAULT_BROWSER_MAX);
    this.maxOperationsPerBrowser = Math.max(
      1,
      moduleOptions?.browser?.maxOperationsPerBrowser ?? DEFAULT_MAX_OPERATIONS,
    );
  }

  public async onModuleInit(): Promise<void> {
    if (this.min > 0) {
      try {
        await this.initialize();
      } catch {
        // Allow lazy browser creation on first request if prewarming fails
      }
    }
  }

  public async onModuleDestroy(): Promise<void> {
    await this.closeAll();
  }

  public async initialize(): Promise<void> {
    while (this.browsers.length < this.min) {
      const b = await this.spawnBrowser();
      this.browsers.push(b);
    }
  }

  public async acquire(): Promise<PooledBrowser> {
    if (this.isShuttingDown) {
      throw new PdfEngineError('Cannot acquire browser: pool is shutting down');
    }

    await this.cleanupStaleBrowsers();

    let candidate = this.browsers.find(
      (b) => b.browser.isConnected() && b.operationsCount < this.maxOperationsPerBrowser,
    );

    if (!candidate && this.browsers.length < this.max) {
      candidate = await this.spawnBrowser();
      this.browsers.push(candidate);
    }

    if (!candidate) {
      const healthyBrowsers = this.browsers.filter((b) => b.browser.isConnected());
      if (healthyBrowsers.length > 0) {
        healthyBrowsers.sort((a, b) => a.inUseCount - b.inUseCount);
        candidate = healthyBrowsers[0];
      }
    }

    if (!candidate) {
      candidate = await this.spawnBrowser();
      this.browsers.push(candidate);
    }

    candidate.inUseCount++;
    candidate.operationsCount++;

    return candidate;
  }

  public async release(pooled: PooledBrowser): Promise<void> {
    pooled.inUseCount = Math.max(0, pooled.inUseCount - 1);

    if (!pooled.browser.isConnected()) {
      await this.destroyBrowser(pooled);
      await this.ensureMinimumBrowsers();
      return;
    }

    if (pooled.operationsCount >= this.maxOperationsPerBrowser && pooled.inUseCount === 0) {
      this.emitEvent('browser.recycled', {
        browserId: pooled.id,
        operations: pooled.operationsCount,
      });

      await this.destroyBrowser(pooled);
      await this.ensureMinimumBrowsers();
    }
  }

  public async closeAll(): Promise<void> {
    this.isShuttingDown = true;
    const targets = [...this.browsers];
    this.browsers.length = 0;
    const promises = targets.map(async (b) => {
      await this.manager.closeBrowser(b.browser);
    });
    await Promise.allSettled(promises);
  }

  public getPoolSize(): number {
    return this.browsers.length;
  }

  private async spawnBrowser(): Promise<PooledBrowser> {
    const { id, browser } = await this.manager.launchBrowser();
    const pooled: PooledBrowser = {
      id,
      browser,
      operationsCount: 0,
      inUseCount: 0,
      createdAt: Date.now(),
    };

    browser.on('disconnected', () => {
      this.emitEvent('browser.error', {
        browserId: pooled.id,
        reason: 'Browser disconnected unexpectedly',
      });
      void this.destroyBrowser(pooled);
    });

    this.emitEvent('browser.created', {
      browserId: pooled.id,
      totalInPool: this.browsers.length + 1,
    });

    return pooled;
  }

  private async destroyBrowser(pooled: PooledBrowser): Promise<void> {
    const idx = this.browsers.indexOf(pooled);
    if (idx !== -1) {
      this.browsers.splice(idx, 1);
    }
    await this.manager.closeBrowser(pooled.browser);
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
    if (this.isShuttingDown || this.min === 0) return;
    while (this.browsers.length < this.min) {
      try {
        const b = await this.spawnBrowser();
        this.browsers.push(b);
      } catch {
        break;
      }
    }
  }

  private emitEvent(type: 'browser.created' | 'browser.recycled' | 'browser.error', metadata?: Record<string, unknown>): void {
    if (this.moduleOptions?.onEvent) {
      this.moduleOptions.onEvent({
        type,
        timestamp: new Date(),
        metadata,
      });
    }
  }
}

