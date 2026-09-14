import { Inject, Injectable, Optional } from '@nestjs/common';
import { Browser } from 'playwright-core';
import { PDF_MODULE_OPTIONS } from '../common/constants/tokens.constants';
import type { PdfModuleOptions } from '../common/types/pdf.types';
import { BrowserLauncher } from './browser-launcher';

@Injectable()
export class BrowserManagerService {
  private readonly launcher: BrowserLauncher;
  private browserCounter = 0;

  constructor(
    @Optional()
    launcherOrOptions?: BrowserLauncher | PdfModuleOptions,
    @Optional()
    @Inject(PDF_MODULE_OPTIONS)
    moduleOptions?: PdfModuleOptions,
  ) {
    if (launcherOrOptions && typeof (launcherOrOptions as BrowserLauncher).launch === 'function') {
      this.launcher = launcherOrOptions as BrowserLauncher;
    } else {
      const opts = (launcherOrOptions as PdfModuleOptions) || moduleOptions;
      this.launcher = new BrowserLauncher(opts);
    }
  }

  /**
   * Launches a new browser instance managed by this service.
   */
  public async launchBrowser(): Promise<{ id: string; browser: Browser }> {
    const browser = await this.launcher.launch();
    this.browserCounter++;
    const id = `browser_${this.browserCounter}_${Date.now()}`;
    return { id, browser };
  }

  /**
   * Closes a browser instance safely if connected.
   */
  public async closeBrowser(browser: Browser): Promise<void> {
    try {
      if (browser.isConnected()) {
        await browser.close();
      }
    } catch {
      // Ignore close errors
    }
  }

  /**
   * Exposes the underlying launcher instance.
   */
  public getLauncher(): BrowserLauncher {
    return this.launcher;
  }
}
