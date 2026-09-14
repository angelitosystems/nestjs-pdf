import { Inject, Injectable, Logger, Optional } from '@nestjs/common';
import { chromium, Browser, LaunchOptions } from 'playwright-core';
import { PDF_MODULE_OPTIONS } from '../common/constants/tokens.constants';
import type { PdfModuleOptions } from '../common/types/pdf.types';
import { BrowserDetector } from './browser-detector';
import { BrowserPoolOptions, DetectedBrowser } from './browser.types';
import {
  PdfBrowserConnectionFailedError,
  PdfBrowserExecutableInvalidError,
  PdfBrowserLaunchFailedError,
  PdfBrowserNotFoundError,
} from '../common/exceptions/pdf.exceptions';

@Injectable()
export class BrowserLauncher {
  private readonly logger = new Logger(BrowserLauncher.name);
  private readonly browserOptions?: BrowserPoolOptions;
  private readonly isLoggingEnabled: boolean;

  constructor(
    @Optional()
    @Inject(PDF_MODULE_OPTIONS)
    private readonly moduleOptions?: PdfModuleOptions,
  ) {
    this.browserOptions = moduleOptions?.browser;
    this.isLoggingEnabled = moduleOptions?.logger?.enabled !== false;
  }

  /**
   * Resolves the executable path or throws an error based on configured mode.
   */
  public resolveExecutable(): { executablePath: string; detected?: DetectedBrowser } {
    const mode = this.browserOptions?.mode ?? 'auto';
    const configuredPath = this.browserOptions?.executablePath;

    if (mode === 'executable') {
      if (!configuredPath) {
        throw new PdfBrowserExecutableInvalidError(
          '',
          'Mode is set to "executable" but browser.executablePath was not provided.',
        );
      }
      if (!BrowserDetector.isExecutable(configuredPath)) {
        throw new PdfBrowserExecutableInvalidError(
          configuredPath,
          'File does not exist or is not a regular executable file.',
        );
      }
      return { executablePath: configuredPath };
    }

    if (mode === 'auto') {
      if (configuredPath) {
        if (!BrowserDetector.isExecutable(configuredPath)) {
          throw new PdfBrowserExecutableInvalidError(
            configuredPath,
            'Specified browser.executablePath does not exist.',
          );
        }
        return { executablePath: configuredPath };
      }

      // Auto-detect browser on host
      const detected = BrowserDetector.findFirst();
      if (!detected) {
        throw new PdfBrowserNotFoundError();
      }

      if (this.isLoggingEnabled) {
        this.logger.debug(
          `Auto-detected compatible browser: ${detected.name} at "${detected.executablePath}"`,
        );
      }

      return { executablePath: detected.executablePath, detected };
    }

    throw new PdfBrowserLaunchFailedError(`Unsupported launch mode: "${mode}"`);
  }

  /**
   * Launches a new browser instance using playwright-core.
   */
  public async launch(): Promise<Browser> {
    const mode = this.browserOptions?.mode ?? 'auto';

    if (mode === 'connect') {
      return this.connect();
    }

    const { executablePath, detected } = this.resolveExecutable();

    const defaultArgs = [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--no-zygote',
      '--font-render-hinting=medium',
    ];

    const launchOptions: LaunchOptions = {
      headless: true,
      executablePath,
      args: defaultArgs,
      ...this.browserOptions?.launchOptions,
    };

    try {
      return await chromium.launch(launchOptions);
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err));
      throw new PdfBrowserLaunchFailedError(
        `Failed to start browser (${detected?.name || executablePath}): ${error.message}`,
        error,
        { executablePath, mode },
      );
    }
  }

  /**
   * Connects to a remote browser via CDP or WebSocket.
   */
  public async connect(): Promise<Browser> {
    const endpoint = this.browserOptions?.endpoint || this.browserOptions?.cdpUrl;
    if (!endpoint) {
      throw new PdfBrowserConnectionFailedError(
        '',
        new Error('Mode is set to "connect" but neither "endpoint" nor "cdpUrl" was configured.'),
      );
    }

    try {
      if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
        return await chromium.connectOverCDP(endpoint);
      }
      return await chromium.connect(endpoint);
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err));
      throw new PdfBrowserConnectionFailedError(endpoint, error);
    }
  }
}
