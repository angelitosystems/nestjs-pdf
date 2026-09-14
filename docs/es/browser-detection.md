# Detección Automática de Navegador

`@angelitosystems/nestjs-pdf` incluye un motor de detección multiplataforma (`BrowserDetector`) capaz de localizar navegadores Chromium existentes en el sistema sin necesidad de configuración previa ni descargas de navegadores.

## Navegadores Compatibles

El detector busca en rutas estándar y en la variable `PATH`:
1. **Google Chrome**
2. **Microsoft Edge**
3. **Chromium**

### Rutas Analizadas en Windows

- `C:\Program Files\Google\Chrome\Application\chrome.exe`
- `C:\Program Files (x86)\Google\Chrome\Application\chrome.exe`
- `%LOCALAPPDATA%\Google\Chrome\Application\chrome.exe`
- `C:\Program Files\Microsoft\Edge\Application\msedge.exe`
- `C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe`
- `%LOCALAPPDATA%\Microsoft\Edge\Application\msedge.exe`
- Rutas registradas en la variable `PATH`

### Rutas Analizadas en Linux

- `/usr/bin/google-chrome`
- `/usr/bin/google-chrome-stable`
- `/usr/bin/chromium`
- `/usr/bin/chromium-browser`
- `/usr/bin/microsoft-edge`
- `/usr/bin/microsoft-edge-stable`
- Binarios de Snap y Flatpak (`/snap/bin/*`, `/var/lib/flatpak/exports/bin/*`)
- Directorios presentes en `$PATH`

### Rutas Analizadas en macOS

- `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`
- `~/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`
- `/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge`
- `~/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge`
- `/Applications/Chromium.app/Contents/MacOS/Chromium`
- `~/Applications/Chromium.app/Contents/MacOS/Chromium`

## Uso Programático

Puedes utilizar el detector directamente en tus servicios o scripts:

```typescript
import { BrowserDetector } from '@angelitosystems/nestjs-pdf';

// Encontrar el primer navegador compatible:
const browser = BrowserDetector.findFirst();
if (browser) {
  console.log(`Encontrado: ${browser.name} en ${browser.executablePath}`);
}

// Encontrar todos los navegadores instalados:
const allBrowsers = BrowserDetector.findAll();

// Ejecutar diagnóstico completo:
const diag = BrowserDetector.diagnose();
console.log('¿Motor listo para generar PDFs?', diag.isReady);
```
