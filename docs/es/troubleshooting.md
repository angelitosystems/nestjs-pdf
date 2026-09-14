# Solución de Problemas (Troubleshooting)

Encuentra soluciones rápidas a incidencias habituales con el navegador y la renderización.

## 1. `PDF_BROWSER_NOT_FOUND`

### Síntoma
```json
{
  "success": false,
  "error": {
    "code": "PDF_BROWSER_NOT_FOUND",
    "message": "No compatible Chromium-based browser was found."
  }
}
```

### Soluciones
1. Instala Google Chrome, Microsoft Edge o Chromium en el sistema.
2. O bien, configura explícitamente la ruta al binario en tu módulo:
   ```typescript
   PdfModule.forRoot({
     browser: {
       executablePath: '/usr/bin/chromium',
     },
   });
   ```
3. Ejecuta el CLI doctor para comprobar la detección:
   ```bash
   bunx angelito-pdf doctor
   ```

---

## 2. `PDF_BROWSER_LAUNCH_FAILED`

### Síntoma
El ejecutable del navegador existe, pero falla al iniciar el proceso.

### Causas Habituales y Solución
- **Faltan librerías compartidas en Linux/Docker**: Asegúrate de instalar paquetes como `libnss3`, `libatk-bridge2.0-0`, `libgbm1` con `apt-get install -y chromium`.
- **Permisos de sandbox**: Al ejecutar como root en Docker, se requiere `--no-sandbox` (incluido por defecto en `BrowserLauncher`).
- **Depuración**: Define `DEBUG=true` o `NODE_ENV=development` en tus variables de entorno para ver los detalles internos y el stack trace de Playwright en `details.causeMessage`.

---

## 3. `PDF_BROWSER_EXECUTABLE_INVALID`

### Síntoma
```json
{
  "success": false,
  "error": {
    "code": "PDF_BROWSER_EXECUTABLE_INVALID",
    "message": "Invalid browser executable path: \"...\""
  }
}
```

### Solución
Verifica que la ruta configurada en `browser.executablePath` apunte a un archivo regular existente y que el proceso Node.js disponga de permisos de ejecución. En Windows, asegúrate de escapar las barras invertidas (`C:\\Program Files\\...`).
