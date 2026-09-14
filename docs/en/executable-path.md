# Custom `executablePath`

When you prefer to specify a designated binary instead of relying on auto-detection, use `browser.executablePath`.

## Precedence Rule

When `executablePath` is provided, **it takes priority over automatic detection**.

## Platform Examples

### Linux
```typescript
PdfModule.forRoot({
  browser: {
    executablePath: '/usr/bin/chromium',
  },
});
```

### Windows
```typescript
PdfModule.forRoot({
  browser: {
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  },
});
```

### macOS
```typescript
PdfModule.forRoot({
  browser: {
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  },
});
```

## Validation & Errors

If the file at `executablePath` does not exist or is not a valid executable file, `@angelitosystems/nestjs-pdf` throws `PdfBrowserExecutableInvalidError`:

```json
{
  "success": false,
  "error": {
    "code": "PDF_BROWSER_EXECUTABLE_INVALID",
    "message": "Invalid browser executable path: \"/invalid/path/chrome\"",
    "details": {
      "suggestion": "Verify that the executable path points to a valid Chromium-based binary file."
    }
  }
}
```
