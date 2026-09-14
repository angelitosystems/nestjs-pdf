import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { DetectedBrowser } from './browser.types';

export interface BrowserDiagnosticResult {
  platform: NodeJS.Platform;
  arch: string;
  detectedBrowsers: DetectedBrowser[];
  defaultBrowser: DetectedBrowser | null;
  isReady: boolean;
  recommendations?: string[];
}

interface BrowserCandidate {
  name: string;
  type: DetectedBrowser['type'];
  paths: (string | (() => string | undefined))[];
}

@Injectable()
export class BrowserDetector {
  /**
   * Finds the first available compatible Chromium browser on the system.
   */
  public static findFirst(platform: NodeJS.Platform = process.platform): DetectedBrowser | null {
    const all = this.findAll(platform);
    return all.length > 0 ? all[0] : null;
  }

  /**
   * Discovers all available compatible Chromium-based browsers on the system.
   */
  public static findAll(platform: NodeJS.Platform = process.platform): DetectedBrowser[] {
    const candidates = this.getCandidatesForPlatform(platform);
    const discovered: DetectedBrowser[] = [];
    const seenPaths = new Set<string>();

    for (const candidate of candidates) {
      for (const pathProvider of candidate.paths) {
        const rawPath = typeof pathProvider === 'function' ? pathProvider() : pathProvider;
        if (!rawPath) continue;

        const resolved = path.normalize(rawPath);
        if (seenPaths.has(resolved.toLowerCase())) continue;

        if (this.isExecutable(resolved)) {
          seenPaths.add(resolved.toLowerCase());
          discovered.push({
            name: candidate.name,
            executablePath: resolved,
            type: candidate.type,
          });
        }
      }
    }

    // Also inspect system PATH if nothing was found or to catch non-standard installations
    const fromPath = this.searchInPath(platform, seenPaths);
    discovered.push(...fromPath);

    return discovered;
  }

  /**
   * Runs diagnostic check and provides structured information and recommendations.
   */
  public static diagnose(platform: NodeJS.Platform = process.platform): BrowserDiagnosticResult {
    const detected = this.findAll(platform);
    const defaultBrowser = detected.length > 0 ? detected[0] : null;
    const isReady = defaultBrowser !== null;

    const recommendations: string[] = [];
    if (!isReady) {
      recommendations.push('Install Google Chrome, Chromium, or Microsoft Edge on the host system.');
      recommendations.push(
        'Alternatively, configure "browser.executablePath" pointing to an existing Chromium executable.',
      );
      recommendations.push('Or connect to a remote browser via CDP using "browser.endpoint".');
    }

    return {
      platform,
      arch: process.arch,
      detectedBrowsers: detected,
      defaultBrowser,
      isReady,
      recommendations: recommendations.length > 0 ? recommendations : undefined,
    };
  }

  /**
   * Checks if the given path exists and is a regular file.
   */
  public static isExecutable(filePath: string): boolean {
    try {
      if (!fs.existsSync(filePath)) {
        return false;
      }
      const stat = fs.statSync(filePath);
      return stat.isFile();
    } catch {
      return false;
    }
  }

  /**
   * Non-static instance method for NestJS DI usage.
   */
  public findFirst(platform?: NodeJS.Platform): DetectedBrowser | null {
    return BrowserDetector.findFirst(platform);
  }

  /**
   * Non-static instance method for NestJS DI usage.
   */
  public findAll(platform?: NodeJS.Platform): DetectedBrowser[] {
    return BrowserDetector.findAll(platform);
  }

  /**
   * Non-static instance method for NestJS DI usage.
   */
  public diagnose(platform?: NodeJS.Platform): BrowserDiagnosticResult {
    return BrowserDetector.diagnose(platform);
  }

  /**
   * Returns prioritized candidates list by OS platform.
   */
  private static getCandidatesForPlatform(platform: NodeJS.Platform): BrowserCandidate[] {
    if (platform === 'win32') {
      const localAppData = process.env.LOCALAPPDATA || '';
      const programFiles = process.env.ProgramFiles || 'C:\\Program Files';
      const programFilesX86 = process.env['ProgramFiles(x86)'] || 'C:\\Program Files (x86)';

      return [
        {
          name: 'Google Chrome',
          type: 'chrome',
          paths: [
            path.join(programFiles, 'Google', 'Chrome', 'Application', 'chrome.exe'),
            path.join(programFilesX86, 'Google', 'Chrome', 'Application', 'chrome.exe'),
            localAppData ? path.join(localAppData, 'Google', 'Chrome', 'Application', 'chrome.exe') : '',
          ],
        },
        {
          name: 'Microsoft Edge',
          type: 'edge',
          paths: [
            path.join(programFiles, 'Microsoft', 'Edge', 'Application', 'msedge.exe'),
            path.join(programFilesX86, 'Microsoft', 'Edge', 'Application', 'msedge.exe'),
            localAppData ? path.join(localAppData, 'Microsoft', 'Edge', 'Application', 'msedge.exe') : '',
          ],
        },
        {
          name: 'Chromium',
          type: 'chromium',
          paths: [
            path.join(programFiles, 'Chromium', 'Application', 'chrome.exe'),
            path.join(programFilesX86, 'Chromium', 'Application', 'chrome.exe'),
            localAppData ? path.join(localAppData, 'Chromium', 'Application', 'chrome.exe') : '',
          ],
        },
      ];
    }

    if (platform === 'darwin') {
      const home = process.env.HOME || '';
      return [
        {
          name: 'Google Chrome',
          type: 'chrome',
          paths: [
            '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
            home ? path.join(home, 'Applications/Google Chrome.app/Contents/MacOS/Google Chrome') : '',
          ],
        },
        {
          name: 'Microsoft Edge',
          type: 'edge',
          paths: [
            '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
            home ? path.join(home, 'Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge') : '',
          ],
        },
        {
          name: 'Chromium',
          type: 'chromium',
          paths: [
            '/Applications/Chromium.app/Contents/MacOS/Chromium',
            home ? path.join(home, 'Applications/Chromium.app/Contents/MacOS/Chromium') : '',
          ],
        },
      ];
    }

    // Default to Linux / Unix candidates
    const standardDirs = ['/usr/bin', '/usr/local/bin', '/snap/bin', '/var/lib/flatpak/exports/bin'];
    return [
      {
        name: 'Google Chrome',
        type: 'chrome',
        paths: [
          ...standardDirs.map((dir) => path.join(dir, 'google-chrome')),
          ...standardDirs.map((dir) => path.join(dir, 'google-chrome-stable')),
        ],
      },
      {
        name: 'Chromium',
        type: 'chromium',
        paths: [
          ...standardDirs.map((dir) => path.join(dir, 'chromium')),
          ...standardDirs.map((dir) => path.join(dir, 'chromium-browser')),
        ],
      },
      {
        name: 'Microsoft Edge',
        type: 'edge',
        paths: [
          ...standardDirs.map((dir) => path.join(dir, 'microsoft-edge')),
          ...standardDirs.map((dir) => path.join(dir, 'microsoft-edge-stable')),
        ],
      },
    ];
  }

  /**
   * Scans system PATH directories for matching executable names.
   */
  private static searchInPath(platform: NodeJS.Platform, seen: Set<string>): DetectedBrowser[] {
    const results: DetectedBrowser[] = [];
    const envPath = process.env.PATH || '';
    if (!envPath) return results;

    const pathSeparator = platform === 'win32' ? ';' : ':';
    const dirs = envPath.split(pathSeparator).filter(Boolean);

    const namesToCheck: { exe: string; name: string; type: DetectedBrowser['type'] }[] =
      platform === 'win32'
        ? [
            { exe: 'chrome.exe', name: 'Google Chrome', type: 'chrome' },
            { exe: 'msedge.exe', name: 'Microsoft Edge', type: 'edge' },
            { exe: 'chromium.exe', name: 'Chromium', type: 'chromium' },
          ]
        : [
            { exe: 'google-chrome', name: 'Google Chrome', type: 'chrome' },
            { exe: 'google-chrome-stable', name: 'Google Chrome', type: 'chrome' },
            { exe: 'chromium', name: 'Chromium', type: 'chromium' },
            { exe: 'chromium-browser', name: 'Chromium', type: 'chromium' },
            { exe: 'microsoft-edge', name: 'Microsoft Edge', type: 'edge' },
            { exe: 'microsoft-edge-stable', name: 'Microsoft Edge', type: 'edge' },
          ];

    for (const dir of dirs) {
      for (const item of namesToCheck) {
        try {
          const fullPath = path.join(dir, item.exe);
          const normalized = path.normalize(fullPath);
          if (seen.has(normalized.toLowerCase())) continue;

          if (this.isExecutable(normalized)) {
            seen.add(normalized.toLowerCase());
            results.push({
              name: item.name,
              executablePath: normalized,
              type: item.type,
            });
          }
        } catch {
          // Ignore invalid path components
        }
      }
    }

    return results;
  }
}
