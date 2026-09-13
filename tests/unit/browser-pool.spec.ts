import { BrowserPool } from '../../src/browser/browser-pool';
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

describe('BrowserPool', () => {
  let mockBrowser: {
    isConnected: jest.Mock;
    close: jest.Mock;
    on: jest.Mock;
  };

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

  it('should initialize with configured minimum browsers', async () => {
    const pool = new BrowserPool({ min: 2, max: 5 });
    await pool.initialize();

    expect(chromium.launch).toHaveBeenCalledTimes(2);
    await pool.closeAll();
  });

  it('should acquire and reuse an existing browser', async () => {
    const pool = new BrowserPool({ min: 1, max: 2 });
    await pool.initialize();

    const pooled1 = await pool.acquire();
    expect(pooled1.inUseCount).toBe(1);
    expect(pooled1.operationsCount).toBe(1);

    await pool.release(pooled1);
    expect(pooled1.inUseCount).toBe(0);

    // Next acquire should reuse the same browser
    const pooled2 = await pool.acquire();
    expect(pooled2.id).toBe(pooled1.id);
    expect(pooled2.operationsCount).toBe(2);

    await pool.release(pooled2);
    await pool.closeAll();
  });

  it('should recycle browser when maxOperationsPerBrowser is reached', async () => {
    const events: string[] = [];
    const pool = new BrowserPool(
      { min: 1, max: 2, maxOperationsPerBrowser: 2 },
      (evt) => events.push(evt.type),
    );
    await pool.initialize();

    const b1 = await pool.acquire(); // op 1
    await pool.release(b1);

    const b2 = await pool.acquire(); // op 2
    expect(b2.id).toBe(b1.id);

    // Releasing after reaching maxOperations should trigger recycling
    await pool.release(b2);

    expect(events).toContain('browser.recycled');
    expect(closeSpies.some((s) => s.mock.calls.length > 0)).toBe(true);

    await pool.closeAll();
  });

  it('should clean up disconnected browser on acquire', async () => {
    const pool = new BrowserPool({ min: 1, max: 2 });
    await pool.initialize();

    const pooled = await pool.acquire();
    // Mark acquired browser as disconnected
    (pooled.browser.isConnected as jest.Mock).mockReturnValue(false);
    await pool.release(pooled);

    // Next acquire should detect disconnected browser, discard it, and launch fresh replacement
    const freshBrowser = await pool.acquire();
    expect(freshBrowser).toBeDefined();
    expect(chromium.launch).toHaveBeenCalledTimes(2);

    await pool.closeAll();
  });

  it('should close all browsers on closeAll', async () => {
    const pool = new BrowserPool({ min: 2, max: 3 });
    await pool.initialize();

    await pool.closeAll();
    expect(closeSpies.length).toBe(2);
    for (const spy of closeSpies) {
      expect(spy).toHaveBeenCalled();
    }
  });
});
