import { BrowserLauncher } from '../../src/browser/browser-launcher';
import { BrowserManagerService } from '../../src/browser/browser-manager.service';
import { BrowserDetector } from '../../src/browser/browser-detector';
import { chromium, Browser } from 'playwright-core';
import {
  PdfBrowserConnectionFailedError,
  PdfBrowserExecutableInvalidError,
  PdfBrowserLaunchFailedError,
  PdfBrowserNotFoundError,
} from '../../src/common/exceptions/pdf.exceptions';

jest.mock('playwright-core', () => ({
  chromium: {
    launch: jest.fn(),
    connect: jest.fn(),
    connectOverCDP: jest.fn(),
  },
}));

describe('BrowserLauncher & BrowserManager', () => {
  const mockLaunch = chromium.launch as jest.Mock;
  const mockConnect = chromium.connect as jest.Mock;
  const mockConnectOverCDP = chromium.connectOverCDP as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Mode: auto', () => {
    it('should launch with explicit executablePath if provided and valid', async () => {
      jest.spyOn(BrowserDetector, 'isExecutable').mockReturnValue(true);
      const fakeBrowser = { isConnected: () => true, close: jest.fn() } as unknown as Browser;
      mockLaunch.mockResolvedValue(fakeBrowser);

      const launcher = new BrowserLauncher({
        browser: {
          mode: 'auto',
          executablePath: 'C:\\Custom\\chrome.exe',
        },
      });

      const browser = await launcher.launch();
      expect(browser).toBe(fakeBrowser);
      expect(mockLaunch).toHaveBeenCalledWith(
        expect.objectContaining({
          executablePath: 'C:\\Custom\\chrome.exe',
        }),
      );
    });

    it('should throw PdfBrowserExecutableInvalidError if configured executablePath does not exist', async () => {
      jest.spyOn(BrowserDetector, 'isExecutable').mockReturnValue(false);

      const launcher = new BrowserLauncher({
        browser: {
          mode: 'auto',
          executablePath: '/non/existent/chromium',
        },
      });

      await expect(launcher.launch()).rejects.toThrow(PdfBrowserExecutableInvalidError);
    });

    it('should auto-detect browser when executablePath is unset', async () => {
      jest.spyOn(BrowserDetector, 'findFirst').mockReturnValue({
        name: 'Google Chrome',
        executablePath: '/usr/bin/google-chrome',
        type: 'chrome',
      });
      const fakeBrowser = { isConnected: () => true } as unknown as Browser;
      mockLaunch.mockResolvedValue(fakeBrowser);

      const launcher = new BrowserLauncher({
        browser: {
          mode: 'auto',
        },
      });

      const browser = await launcher.launch();
      expect(browser).toBe(fakeBrowser);
      expect(mockLaunch).toHaveBeenCalledWith(
        expect.objectContaining({
          executablePath: '/usr/bin/google-chrome',
        }),
      );
    });

    it('should throw PdfBrowserNotFoundError when no browser is detected', async () => {
      jest.spyOn(BrowserDetector, 'findFirst').mockReturnValue(null);

      const launcher = new BrowserLauncher({
        browser: {
          mode: 'auto',
        },
      });

      await expect(launcher.launch()).rejects.toThrow(PdfBrowserNotFoundError);
    });

    it('should throw PdfBrowserLaunchFailedError when chromium.launch fails', async () => {
      jest.spyOn(BrowserDetector, 'findFirst').mockReturnValue({
        name: 'Chromium',
        executablePath: '/usr/bin/chromium',
        type: 'chromium',
      });
      mockLaunch.mockRejectedValue(new Error('Process crashed on startup'));

      const launcher = new BrowserLauncher({
        browser: { mode: 'auto' },
      });

      await expect(launcher.launch()).rejects.toThrow(PdfBrowserLaunchFailedError);
    });
  });

  describe('Mode: executable', () => {
    it('should require executablePath in executable mode', async () => {
      const launcher = new BrowserLauncher({
        browser: {
          mode: 'executable',
        },
      });

      await expect(launcher.launch()).rejects.toThrow(PdfBrowserExecutableInvalidError);
    });

    it('should launch with valid executablePath', async () => {
      jest.spyOn(BrowserDetector, 'isExecutable').mockReturnValue(true);
      const fakeBrowser = { isConnected: () => true } as unknown as Browser;
      mockLaunch.mockResolvedValue(fakeBrowser);

      const launcher = new BrowserLauncher({
        browser: {
          mode: 'executable',
          executablePath: '/usr/bin/chromium',
        },
      });

      const browser = await launcher.launch();
      expect(browser).toBe(fakeBrowser);
    });
  });

  describe('Mode: connect', () => {
    it('should connect via CDP when endpoint is http/https URL', async () => {
      const fakeBrowser = { isConnected: () => true } as unknown as Browser;
      mockConnectOverCDP.mockResolvedValue(fakeBrowser);

      const launcher = new BrowserLauncher({
        browser: {
          mode: 'connect',
          endpoint: 'http://localhost:9222',
        },
      });

      const browser = await launcher.launch();
      expect(browser).toBe(fakeBrowser);
      expect(mockConnectOverCDP).toHaveBeenCalledWith('http://localhost:9222');
    });

    it('should connect via WebSocket when endpoint is ws:// URL', async () => {
      const fakeBrowser = { isConnected: () => true } as unknown as Browser;
      mockConnect.mockResolvedValue(fakeBrowser);

      const launcher = new BrowserLauncher({
        browser: {
          mode: 'connect',
          endpoint: 'ws://localhost:9222/devtools/browser/xyz',
        },
      });

      const browser = await launcher.launch();
      expect(browser).toBe(fakeBrowser);
      expect(mockConnect).toHaveBeenCalledWith('ws://localhost:9222/devtools/browser/xyz');
    });

    it('should throw PdfBrowserConnectionFailedError when connect fails', async () => {
      mockConnect.mockRejectedValue(new Error('Connection refused'));

      const launcher = new BrowserLauncher({
        browser: {
          mode: 'connect',
          endpoint: 'ws://localhost:9999',
        },
      });

      await expect(launcher.launch()).rejects.toThrow(PdfBrowserConnectionFailedError);
    });
  });

  describe('BrowserManagerService', () => {
    it('should launch and track browser with unique id', async () => {
      const fakeBrowser = { isConnected: () => true, close: jest.fn() } as unknown as Browser;
      mockLaunch.mockResolvedValue(fakeBrowser);
      jest.spyOn(BrowserDetector, 'findFirst').mockReturnValue({
        name: 'Google Chrome',
        executablePath: '/path/chrome',
        type: 'chrome',
      });

      const manager = new BrowserManagerService({ browser: { mode: 'auto' } });
      const { id, browser } = await manager.launchBrowser();

      expect(id).toMatch(/^browser_\d+_\d+$/);
      expect(browser).toBe(fakeBrowser);
    });

    it('should close browser safely when connected', async () => {
      const closeSpy = jest.fn().mockResolvedValue(undefined);
      const fakeBrowser = {
        isConnected: jest.fn().mockReturnValue(true),
        close: closeSpy,
      } as unknown as Browser;

      const manager = new BrowserManagerService();
      await manager.closeBrowser(fakeBrowser);

      expect(closeSpy).toHaveBeenCalled();
    });

    it('should ignore close errors gracefully', async () => {
      const fakeBrowser = {
        isConnected: jest.fn().mockReturnValue(true),
        close: jest.fn().mockRejectedValue(new Error('Already closed')),
      } as unknown as Browser;

      const manager = new BrowserManagerService();
      await expect(manager.closeBrowser(fakeBrowser)).resolves.not.toThrow();
    });
  });
});
