# Guía de Despliegue en Docker

Desplegar Chromium en contenedores Docker requiere dependencias del sistema y gestión adecuada de procesos huérfanos. Gracias a `playwright-core`, instalas el paquete ligero de Chromium vía `apt` sin descargar 500MB durante `npm install`.

## Dockerfile Multi-etapa de Producción

```dockerfile
# ----------------------------------------------------
# Etapa 1: Compilación
# ----------------------------------------------------
FROM node:20-bookworm-slim AS builder
WORKDIR /app

COPY package*.json ./
# Instalación rápida: playwright-core NO descarga navegadores pesados
RUN npm ci

COPY . .
RUN npm run build

# ----------------------------------------------------
# Etapa 2: Ejecutor de Producción
# ----------------------------------------------------
FROM node:20-bookworm-slim AS runner

# Instalar Chromium del sistema y dumb-init
RUN apt-get update && apt-get install -y --no-install-recommends \
    dumb-init \
    chromium \
    fonts-liberation \
    fonts-noto-color-emoji \
    fonts-noto-cjk \
    libnss3 \
    libatk-bridge2.0-0 \
    libx11-xcb1 \
    libdrm2 \
    libgbm1 \
    libasound2 \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# ¡BrowserDetector detecta automáticamente /usr/bin/chromium!
ENV PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium
ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1
ENV NODE_ENV=production

WORKDIR /app

# Usuario no privilegiado por seguridad
RUN groupadd -r nestjs && useradd -r -g nestjs nestjs \
    && mkdir -p /app/dist /app/storage \
    && chown -R nestjs:nestjs /app

USER nestjs

# dumb-init limpia procesos zombie de Chromium
ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["node", "dist/main.js"]
```

## Configuración en NestJS para Docker

La configuración cero funciona de inmediato porque `BrowserDetector` detecta `/usr/bin/chromium`:

```typescript
PdfModule.forRoot()
```

O de forma explícita:

```typescript
PdfModule.forRoot({
  browser: {
    executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || '/usr/bin/chromium',
  },
});
```
