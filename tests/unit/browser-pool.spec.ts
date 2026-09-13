import { BrowserPoolService } from '../../src/browser/browser-pool.service';
import { BrowserManagerService } from '../../src/browser/browser-manager.service';
import { chromium, Browser } from 'playwright-core';

jest.mock('playwright-core', () => ({
  chromium: {
    launch: jest.fn(),
  },
  firefox: {
    launch: jest.fn(),
  },
  webkit: {
    launch: jest.fn(),
  },
}));

describe('BrowserPoolService', () => {
  const closeSpies: jest.Mock[] = [];

  beforeEach(() => {
    jest.clearAllMocks();
    closeSpies.length = 0;
    (chromium.launch as jest.Mock).mockImplementation(() => {
      const closeSpy = jest.fn().mockResolvedValue(undefined);
      closeSpies.push(closeSpy);
      return Promise.resolve({
        isConnected: jest.fn().mockReturnValue(true),
        close: closeSpy,
        on: jest.fn(),
      } as unknown as Browser);
    });
  });

  const createPool = (opts = {}, onEvent?: (e: unknown) => void) => {
    const manager = new BrowserManagerService({ browser: opts });
    return new BrowserPoolService(manager, { browser: opts, onEvent: onEvent as never });
  };

  it('should initialize with configured minimum browsers', async () => {
    const pool = createPool({ min: 2, max: 5 });
    await pool.initialize();

    expect(chromium.launch).toHaveBeenCalledTimes(2);
    await pool.closeAll();
  });

  it('should acquire and reuse an existing browser', async () => {
    const pool = createPool({ min: 1, max: 2 });
    await pool.initialize();

    const pooled1 = await pool.acquire();
    expect(pooled1.inUseCount).toBe(1);
    expect(pooled1.operationsCount).toBe(1);

    await pool.release(pooled1);
    expect(pooled1.inUseCount).toBe(0);

    const pooled2 = await pool.acquire();
    expect(pooled2.id).toBe(pooled1.id);
    expect(pooled2.operationsCount).toBe(2);

    await pool.release(pooled2);
    await pool.closeAll();
  });

  it('should recycle browser when maxOperationsPerBrowser is reached', async () => {
    const events: string[] = [];
    const pool = createPool(
      { min: 1, max: 2, maxOperationsPerBrowser: 2 },
      (evt: unknown) => events.push((evt as { type: string }).type),
    );
    await pool.initialize();

    const b1 = await pool.acquire();
    await pool.release(b1);

    const b2 = await pool.acquire();
    expect(b2.id).toBe(b1.id);

    await pool.release(b2);

    expect(events).toContain('browser.recycled');
    expect(closeSpies.some((s) => s.mock.calls.length > 0)).toBe(true);

    await pool.closeAll();
  });

  it('should clean up disconnected browser on acquire', async () => {
    const pool = createPool({ min: 1, max: 2 });
    await pool.initialize();

    const pooled = await pool.acquire();
    (pooled.browser.isConnected as jest.Mock).mockReturnValue(false);
    await pool.release(pooled);

    const freshBrowser = await pool.acquire();
    expect(freshBrowser).toBeDefined();
    expect(chromium.launch).toHaveBeenCalledTimes(2);

    await pool.closeAll();
  });

  it('should close all browsers on closeAll', async () => {
    const pool = createPool({ min: 2, max: 3 });
    await pool.initialize();

    await pool.closeAll();
    expect(closeSpies.length).toBe(2);
    for (const spy of closeSpies) {
      expect(spy).toHaveBeenCalled();
    }
  });
});
