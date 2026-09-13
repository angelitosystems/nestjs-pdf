import { Browser } from 'playwright-core';

export interface PooledBrowser {
  id: string;
  browser: Browser;
  operationsCount: number;
  inUseCount: number;
  createdAt: number;
}
