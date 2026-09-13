import { BrowserPoolOptions } from '../../pdf/pdf.types';

export interface PlaywrightEngineOptions {
  browser?: BrowserPoolOptions;
  defaultTimeout?: number;
}

