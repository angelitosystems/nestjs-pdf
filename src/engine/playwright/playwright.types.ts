import { BrowserPoolOptions } from '../../common/types/pdf.types';

export interface PlaywrightEngineConfig {
  browser?: BrowserPoolOptions;
  timeout?: number;
}

