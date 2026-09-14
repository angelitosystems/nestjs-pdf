# Automatic Browser Detection

`@angelitosystems/nestjs-pdf` features a cross-platform detection engine (`BrowserDetector`) that discovers installed Chromium browsers without requiring user configuration or browser downloads.

## Discovered Browsers

The detector probes standard installation directories and system PATH for:
1. **Google Chrome**
2. **Microsoft Edge**
3. **Chromium**

### Windows Paths Checked

- `C:\Program Files\Google\Chrome\Application\chrome.exe`
- `C:\Program Files (x86)\Google\Chrome\Application\chrome.exe`
- `%LOCALAPPDATA%\Google\Chrome\Application\chrome.exe`
- `C:\Program Files\Microsoft\Edge\Application\msedge.exe`
- `C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe`
- `%LOCALAPPDATA%\Microsoft\Edge\Application\msedge.exe`
- System `PATH` directories via `where.exe`

### Linux Paths Checked

- `/usr/bin/google-chrome`
- `/usr/bin/google-chrome-stable`
- `/usr/bin/chromium`
- `/usr/bin/chromium-browser`
- `/usr/bin/microsoft-edge`
- `/usr/bin/microsoft-edge-stable`
- Snap and Flatpak binaries (`/snap/bin/*`, `/var/lib/flatpak/exports/bin/*`)
- Directories in `$PATH`

### macOS Paths Checked

- `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`
- `~/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`
- `/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge`
- `~/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge`
- `/Applications/Chromium.app/Contents/MacOS/Chromium`
- `~/Applications/Chromium.app/Contents/MacOS/Chromium`

## Programmatic Detection

You can use the detector programmatically in your services:

```typescript
import { BrowserDetector } from '@angelitosystems/nestjs-pdf';

// Find first suitable browser:
const browser = BrowserDetector.findFirst();
if (browser) {
  console.log(`Found ${browser.name} at: ${browser.executablePath}`);
}

// Find all installed browsers:
const allBrowsers = BrowserDetector.findAll();

// Run full diagnostics:
const diag = BrowserDetector.diagnose();
console.log('Ready:', diag.isReady);
```
