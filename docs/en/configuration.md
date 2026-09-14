# Configuration Guide

`@angelitosystems/nestjs-pdf` offers flexible configuration modes: zero-config, explicit executable paths, browser pools, and remote browser connections.

## Zero Configuration

When Chrome, Edge, or Chromium is present on your system:

```typescript
import { Module } from '@nestjs/common';
import { PdfModule } from '@angelitosystems/nestjs-pdf';

@Module({
  imports: [
    PdfModule.forRoot(),
  ],
})
export class AppModule {}
```

## Browser Modes

Configure the browser lifecycle using the `mode` option:

```typescript
type BrowserMode = 'auto' | 'executable' | 'connect';
```

### 1. Mode `auto` (Default)
1. Uses `browser.executablePath` if explicitly configured.
2. Otherwise, scans host system for Chrome, Edge, or Chromium.
3. If none is found, throws `PdfBrowserNotFoundError`.

```typescript
PdfModule.forRoot({
  browser: {
    mode: 'auto',
  },
});
```

### 2. Mode `executable`
Strictly enforces using the configured `executablePath`. If the file is missing or invalid, throws `PdfBrowserExecutableInvalidError`.

```typescript
PdfModule.forRoot({
  browser: {
    mode: 'executable',
    executablePath: '/usr/bin/chromium',
  },
});
```

### 3. Mode `connect`
Connects to an existing remote browser instance over Chrome DevTools Protocol (CDP) or WebSocket.

```typescript
PdfModule.forRoot({
  browser: {
    mode: 'connect',
    endpoint: 'http://browserless-host:9222',
  },
});
```

## Browser Pool Configuration

Configure standby browser instances and automatic recycling to ensure optimum memory management:

```typescript
PdfModule.forRoot({
  browser: {
    pool: {
      min: 1,                          // Minimum warm standby browser processes
      max: 5,                          // Maximum browser processes under high load
      maxOperationsPerBrowser: 100,     // Recycles process after 100 renders
    },
  },
});
```

## Asynchronous Configuration

Inject dependencies using `forRootAsync`:

```typescript
import { ConfigModule, ConfigService } from '@nestjs/config';

PdfModule.forRootAsync({
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: (config: ConfigService) => ({
    browser: {
      executablePath: config.get<string>('BROWSER_PATH'),
      pool: {
        min: config.get<number>('PDF_POOL_MIN', 1),
        max: config.get<number>('PDF_POOL_MAX', 5),
      },
    },
  }),
});
```
