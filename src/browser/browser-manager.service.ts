import { Inject, Injectable, Optional } from '@nestjs/common';
import { chromium, firefox, webkit, Browser, BrowserType, LaunchOptions } from 'playwright-core';
import { PDF_MODULE_OPTIONS } from '../common/constants/tokens.constants';
import { BrowserPoolOptions, PdfModuleOptions } from '../common/types/pdf.types';
import { PdfEngineError } from '../common/exceptions/pdf.exceptions';

@Injectable()
export class BrowserManagerService {
  private readonly browserOptions?: BrowserPoolOptions;
  private browserCounter = 0;

  constructor(
    @Optional()
    @Inject(PDF_MODULE_OPTIONS)
    private readonly moduleOptions?: PdfModuleOptions,
  ) {
    this.browserOptions = moduleOptions?.browser;
  }

  public async launchBrowser(): Promise<{ id: string; browser: Browser }> {
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
      ...this.browserOptions?.launchOptions,
    };

    if (this.browserOptions?.executablePath) {
      launchOptions.executablePath = this.browserOptions.executablePath;
    }

    try {
      const browser = await browserType.launch(launchOptions);
      this.browserCounter++;
      const id = `browser_${this.browserCounter}_${Date.now()}`;
      return { id, browser };
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      throw new PdfEngineError(
        `Failed to launch Playwright browser. Ensure Chromium is installed via "npx playwright install chromium" or provide executablePath. Details: ${error.message}`,
        error,
      );
    }
  }

  public async closeBrowser(browser: Browser): Promise<void> {
    try {
      if (browser.isConnected()) {
        await browser.close();
      }
    } catch {
      // Ignore close errors
    }
  }

  private resolveBrowserType(): BrowserType {
    const type = this.browserOptions?.browserType ?? 'chromium';
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
}
