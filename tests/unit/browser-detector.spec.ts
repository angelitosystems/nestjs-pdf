import * as fs from 'fs';
import { BrowserDetector } from '../../src/browser/browser-detector';

jest.mock('fs', () => {
  const original = jest.requireActual('fs');
  return {
    ...original,
    existsSync: jest.fn(),
    statSync: jest.fn(),
  };
});

describe('BrowserDetector', () => {
  const mockExistsSync = fs.existsSync as jest.Mock;
  const mockStatSync = fs.statSync as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('isExecutable', () => {
    it('should return true for an existing regular file', () => {
      mockExistsSync.mockReturnValue(true);
      mockStatSync.mockReturnValue({ isFile: () => true });

      expect(BrowserDetector.isExecutable('/path/to/chrome')).toBe(true);
    });

    it('should return false if file does not exist', () => {
      mockExistsSync.mockReturnValue(false);

      expect(BrowserDetector.isExecutable('/path/to/missing')).toBe(false);
    });

    it('should return false if path is a directory', () => {
      mockExistsSync.mockReturnValue(true);
      mockStatSync.mockReturnValue({ isFile: () => false });

      expect(BrowserDetector.isExecutable('/path/to/dir')).toBe(false);
    });

    it('should return false if statSync throws an error', () => {
      mockExistsSync.mockReturnValue(true);
      mockStatSync.mockImplementation(() => {
        throw new Error('Permission denied');
      });

      expect(BrowserDetector.isExecutable('/path/to/forbidden')).toBe(false);
    });
  });

  describe('Windows platform detection', () => {
    it('should detect Google Chrome on Windows', () => {
      mockExistsSync.mockImplementation((p: string) => {
        return p.includes('Google') && p.includes('chrome.exe');
      });
      mockStatSync.mockReturnValue({ isFile: () => true });

      const detected = BrowserDetector.findFirst('win32');
      expect(detected).not.toBeNull();
      expect(detected?.name).toBe('Google Chrome');
      expect(detected?.type).toBe('chrome');
    });

    it('should detect Microsoft Edge on Windows if Chrome is absent', () => {
      mockExistsSync.mockImplementation((p: string) => {
        return p.includes('Edge') && p.includes('msedge.exe');
      });
      mockStatSync.mockReturnValue({ isFile: () => true });

      const detected = BrowserDetector.findFirst('win32');
      expect(detected).not.toBeNull();
      expect(detected?.name).toBe('Microsoft Edge');
      expect(detected?.type).toBe('edge');
    });

    it('should detect Chromium on Windows', () => {
      mockExistsSync.mockImplementation((p: string) => {
        return p.includes('Chromium') && p.includes('chrome.exe');
      });
      mockStatSync.mockReturnValue({ isFile: () => true });

      const detected = BrowserDetector.findFirst('win32');
      expect(detected).not.toBeNull();
      expect(detected?.name).toBe('Chromium');
      expect(detected?.type).toBe('chromium');
    });
  });

  describe('Linux platform detection', () => {
    it('should detect Google Chrome on Linux', () => {
      mockExistsSync.mockImplementation((p: string) => {
        return p === '/usr/bin/google-chrome';
      });
      mockStatSync.mockReturnValue({ isFile: () => true });

      const detected = BrowserDetector.findFirst('linux');
      expect(detected).not.toBeNull();
      expect(detected?.name).toBe('Google Chrome');
      expect(detected?.executablePath).toBe('/usr/bin/google-chrome');
    });

    it('should detect Chromium on Linux', () => {
      mockExistsSync.mockImplementation((p: string) => {
        return p === '/usr/bin/chromium';
      });
      mockStatSync.mockReturnValue({ isFile: () => true });

      const detected = BrowserDetector.findFirst('linux');
      expect(detected).not.toBeNull();
      expect(detected?.name).toBe('Chromium');
      expect(detected?.executablePath).toBe('/usr/bin/chromium');
    });

    it('should detect Microsoft Edge on Linux', () => {
      mockExistsSync.mockImplementation((p: string) => {
        return p === '/usr/bin/microsoft-edge';
      });
      mockStatSync.mockReturnValue({ isFile: () => true });

      const detected = BrowserDetector.findFirst('linux');
      expect(detected).not.toBeNull();
      expect(detected?.name).toBe('Microsoft Edge');
      expect(detected?.executablePath).toBe('/usr/bin/microsoft-edge');
    });
  });

  describe('macOS platform detection', () => {
    it('should detect Google Chrome on macOS', () => {
      mockExistsSync.mockImplementation((p: string) => {
        return p === '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
      });
      mockStatSync.mockReturnValue({ isFile: () => true });

      const detected = BrowserDetector.findFirst('darwin');
      expect(detected).not.toBeNull();
      expect(detected?.name).toBe('Google Chrome');
      expect(detected?.type).toBe('chrome');
    });

    it('should detect Microsoft Edge on macOS', () => {
      mockExistsSync.mockImplementation((p: string) => {
        return p === '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge';
      });
      mockStatSync.mockReturnValue({ isFile: () => true });

      const detected = BrowserDetector.findFirst('darwin');
      expect(detected).not.toBeNull();
      expect(detected?.name).toBe('Microsoft Edge');
      expect(detected?.type).toBe('edge');
    });

    it('should detect Chromium on macOS', () => {
      mockExistsSync.mockImplementation((p: string) => {
        return p === '/Applications/Chromium.app/Contents/MacOS/Chromium';
      });
      mockStatSync.mockReturnValue({ isFile: () => true });

      const detected = BrowserDetector.findFirst('darwin');
      expect(detected).not.toBeNull();
      expect(detected?.name).toBe('Chromium');
      expect(detected?.type).toBe('chromium');
    });
  });

  describe('No browser detected', () => {
    it('should return null when no browser exists on the host', () => {
      mockExistsSync.mockReturnValue(false);

      const detected = BrowserDetector.findFirst('linux');
      expect(detected).toBeNull();
    });

    it('should return isReady: false and recommendations on diagnose() when no browser is found', () => {
      mockExistsSync.mockReturnValue(false);

      const result = BrowserDetector.diagnose('linux');
      expect(result.isReady).toBe(false);
      expect(result.defaultBrowser).toBeNull();
      expect(result.detectedBrowsers).toHaveLength(0);
      expect(result.recommendations).toBeDefined();
      expect(result.recommendations?.length).toBeGreaterThan(0);
    });

    it('should return isReady: true and defaultBrowser on diagnose() when browser is found', () => {
      mockExistsSync.mockImplementation((p: string) => p === '/usr/bin/chromium');
      mockStatSync.mockReturnValue({ isFile: () => true });

      const result = BrowserDetector.diagnose('linux');
      expect(result.isReady).toBe(true);
      expect(result.defaultBrowser).not.toBeNull();
      expect(result.defaultBrowser?.name).toBe('Chromium');
    });
  });

  describe('NestJS Service Instance methods', () => {
    it('should delegate findFirst, findAll and diagnose via service instance', () => {
      mockExistsSync.mockImplementation((p: string) => p === '/usr/bin/chromium');
      mockStatSync.mockReturnValue({ isFile: () => true });

      const service = new BrowserDetector();
      expect(service.findFirst('linux')?.name).toBe('Chromium');
      expect(service.findAll('linux').length).toBeGreaterThanOrEqual(1);
      expect(service.diagnose('linux').isReady).toBe(true);
    });
  });
});
