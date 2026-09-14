# Docker Integration & Best Practices

Deploying Chromium inside Docker containers requires proper system dependencies and process management. With `@angelitosystems/nestjs-pdf` and `playwright-core`, you install lightweight OS Chromium via `apt` without downloading 500MB during `npm install`.

## Multi-stage Production Dockerfile

```dockerfile
# ----------------------------------------------------
# Stage 1: Build Application
# ----------------------------------------------------
FROM node:20-bookworm-slim AS builder
WORKDIR /app

COPY package*.json ./
# Fast installation - playwright-core does NOT download browsers here
RUN npm ci

COPY . .
RUN npm run build

# ----------------------------------------------------
# Stage 2: Production Runner
# ----------------------------------------------------
FROM node:20-bookworm-slim AS runner

# Install OS-level Chromium and dumb-init
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

# BrowserDetector automatically detects /usr/bin/chromium!
ENV PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium
ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1
ENV NODE_ENV=production

WORKDIR /app

# Run as non-root user for security
RUN groupadd -r nestjs && useradd -r -g nestjs nestjs \
    && mkdir -p /app/dist /app/storage \
    && chown -R nestjs:nestjs /app

USER nestjs

# dumb-init reaps zombie browser processes cleanly
ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["node", "dist/main.js"]
```

## NestJS Configuration for Docker

Zero configuration works automatically since `BrowserDetector` discovers `/usr/bin/chromium`:

```typescript
PdfModule.forRoot()
```

Or explicitly:

```typescript
PdfModule.forRoot({
  browser: {
    executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || '/usr/bin/chromium',
  },
});
```
