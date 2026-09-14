import { Browser } from 'playwright-core';

/**
 * Browser acquisition mode.
 * - 'auto': Uses executablePath if given; otherwise auto-detects installed Chrome/Edge/Chromium.
 * - 'executable': Strictly requires and uses executablePath.
 * - 'connect': Connects to a remote browser via CDP / WebSocket.
 */
export type BrowserMode = 'auto' | 'executable' | 'connect';

/**
 * Information regarding a detected browser on the host system.
 */
export interface DetectedBrowser {
  name: string;
  executablePath: string;
  type: 'chrome' | 'edge' | 'chromium' | 'custom';
  version?: string;
}

/**
 * Browser pool sizing and recycling configuration.
 */
export interface BrowserPoolConfig {
  /** Minimum number of browser instances kept warm (default: 1) */
  min?: number;
  /** Maximum number of browser instances in pool (default: 5) */
  max?: number;
  /** Number of operations before browser instance is recycled (default: 100) */
  maxOperationsPerBrowser?: number;
}

/**
 * Options for configuring browser lifecycle, pool and launcher.
 */
export interface BrowserPoolOptions {
  /** Browser acquisition mode (default: 'auto') */
  mode?: BrowserMode;
  /** Whether to automatically search for installed browsers when executablePath is unset (default: true) */
  autoDetect?: boolean;
  /** Explicit path to a Chromium-based executable */
  executablePath?: string;
  /** Remote CDP or WebSocket endpoint for 'connect' mode */
  endpoint?: string;
  /** Alias for endpoint */
  cdpUrl?: string;
  /** Browser pool sizing and recycling settings */
  pool?: BrowserPoolConfig;
  /** Flat alias for pool.min (default: 1) */
  min?: number;
  /** Flat alias for pool.max (default: 5) */
  max?: number;
  /** Flat alias for pool.maxOperationsPerBrowser (default: 100) */
  maxOperationsPerBrowser?: number;
  /** Browser engine type to launch (default: 'chromium') */
  browserType?: 'chromium' | 'firefox' | 'webkit';
  /** Additional launch options passed to Playwright Core */
  launchOptions?: Record<string, unknown>;
}

export interface PooledBrowser {
  id: string;
  browser: Browser;
  operationsCount: number;
  inUseCount: number;
  createdAt: number;
}


