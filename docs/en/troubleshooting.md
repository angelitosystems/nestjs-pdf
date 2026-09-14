# Troubleshooting Guide

Find quick solutions to common browser launch and rendering issues.

## 1. `PDF_BROWSER_NOT_FOUND`

### Symptom
```json
{
  "success": false,
  "error": {
    "code": "PDF_BROWSER_NOT_FOUND",
    "message": "No compatible Chromium-based browser was found."
  }
}
```

### Solutions
1. Install Google Chrome, Microsoft Edge, or Chromium on your system.
2. Alternatively, specify the path to your browser binary:
   ```typescript
   PdfModule.forRoot({
     browser: {
       executablePath: '/usr/bin/chromium',
     },
   });
   ```
3. Run the doctor CLI to verify detection:
   ```bash
   bunx angelito-pdf doctor
   ```

---

## 2. `PDF_BROWSER_LAUNCH_FAILED`

### Symptom
The browser executable exists, but fails to start.

### Common Causes & Fixes
- **Missing shared libraries in Linux/Docker**: Ensure packages like `libnss3`, `libatk-bridge2.0-0`, `libgbm1` are installed via `apt-get install -y chromium`.
- **Sandbox permissions**: When running as root in Docker, pass `--no-sandbox` (handled by default in `BrowserLauncher`).
- **Debugging**: Set `DEBUG=true` or `NODE_ENV=development` in your environment to expose the internal Playwright error stack in `details.causeMessage`.

---

## 3. `PDF_BROWSER_EXECUTABLE_INVALID`

### Symptom
```json
{
  "success": false,
  "error": {
    "code": "PDF_BROWSER_EXECUTABLE_INVALID",
    "message": "Invalid browser executable path: \"...\""
  }
}
```

### Solution
Double check that `browser.executablePath` points to an existing binary file and that the Node.js process has execute permissions. On Windows, ensure path backslashes are properly escaped (e.g. `C:\\Program Files\\...`).
