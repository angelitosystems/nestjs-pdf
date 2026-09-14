# Ruta Personalizada `executablePath`

Cuando prefieres especificar manualmente la ruta del binario en lugar de usar la detección automática, configura `browser.executablePath`.

## Regla de Precedencia

Si `executablePath` está configurado, **tiene prioridad absoluta sobre la detección automática**.

## Ejemplos por Sistema Operativo

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

## Validación y Errores

Si la ruta provista en `executablePath` no existe o no es un archivo ejecutable, `@angelitosystems/nestjs-pdf` lanzará inmediatamente `PdfBrowserExecutableInvalidError`:

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
