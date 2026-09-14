# Seguridad y Mitigación de SSRF

`@angelitosystems/nestjs-pdf` incorpora estrictas medidas de defensa en profundidad para proteger los servidores contra ataques de SSRF, lectura arbitraria de archivos y agotamiento de recursos.

## 1. Protección contra SSRF (Server-Side Request Forgery)

De forma predeterminada, la carga de recursos externos por HTTP/HTTPS está deshabilitada (`allowExternalResources: false`).

Al habilitar recursos externos, cada URL solicitada debe superar rigurosas comprobaciones:
- **Lista Blanca de Dominios**: Solo los dominios definidos en `allowedDomains` pueden ser contactados.
- **Bloqueo de Redes Privadas**: Cualquier IP perteneciente a redes privadas (RFC 1918 `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`, RFC 4193 IPv6) es rechazada incondicionalmente.
- **Bloqueo de Metadatos Cloud**: Puntos de enlace de metadatos (`169.254.169.254` en AWS, GCP, Azure, DigitalOcean) están permanentemente bloqueados.
- **Defensa contra Notaciones Alternativas**: Evasiones que utilizan notaciones decimales (DWORD), octales o hexadecimales de IP son parseadas y denegadas.

## 2. Protección contra Path Traversal

- **Verificación de Límites**: Las rutas de plantillas y assets se resuelven a sus caminos canónicos reales (`fs.realpathSync`).
- **Filtro de Secuencias de Escape**: Secuencias relativas (`../`), puntos codificados (`%2e%2e`), bytes nulos (`%00`) y enlaces simbólicos que apunten fuera de las carpetas autorizadas lanzan inmediatamente `PdfSecurityError`.
- **Límite de Tamaño de Assets**: Los archivos que superen `maxAssetSizeBytes` (10MB por defecto) se bloquean antes de cargarse en memoria.

## 3. Aislamiento en el Navegador

- Cada petición se ejecuta en un `BrowserContext` nuevo y exclusivo.
- Las cookies, almacenamiento local y caché del contexto se destruyen de inmediato al finalizar la solicitud.
- La cancelación cooperativa con `AbortSignal` cierra la página inmediatamente para liberar recursos del sistema.
